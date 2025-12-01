import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";
import puppeteer from "puppeteer";

const app = express();

app.use(cors());
app.use(express.json());

const registerSchema = z.object({
  numero_sorteio: z.union([z.string(), z.number()]),
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  email: z.string().email("Email inválido"),
});

const createSorteioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

app.post("/sorteando/novo", async (req: Request, res: Response) => {
  try {
    const { nome, email } = createSorteioSchema.parse(req.body);
    const targetUrl = `https://sorteando.vercel.app/evento/novo`;

    console.log(`Iniciando criação de sorteio para ${nome}...`);

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
        "--allow-running-insecure-content",
        "--disable-web-security",
        "--allow-mixed-content",
      ],
    });

    const page = await browser.newPage();

    try {
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      // Wait for inputs
      await page.waitForSelector("#nome");

      // Fill form
      await page.type("#nome", nome);
      await page.type("#email", email);

      // Submit
      const submitButtonSelector = 'button[type="submit"]';
      await page.waitForSelector(submitButtonSelector);
      await page.click(submitButtonSelector);

      // Wait for navigation or success element
      // For SPAs, waitForNavigation might be flaky if it's just a history pushState
      try {
        await page.waitForFunction(
          () => window.location.href.includes("/administracao"),
          { timeout: 10000 }
        );
      } catch (e) {
        console.log(
          "Navegação via URL não detectada, tentando esperar pelo conteúdo..."
        );
        await page.waitForFunction(
          () => document.body.innerText.includes("Código de Acesso"),
          { timeout: 10000 }
        );
      }

      // Wait specifically for the access code to appear (it might be async)
      try {
        await page.waitForFunction(
          () => {
            const body = document.body.innerText;
            return /Código de Acesso:\s*\d+/i.test(body);
          },
          { timeout: 5000 }
        );
      } catch (e) {
        console.log("Timeout esperando código de acesso aparecer no texto.");
      }

      // Extract data
      const result = await page.evaluate(() => {
        // Find the link
        const linkElement = Array.from(document.querySelectorAll("a")).find(
          (a) =>
            a.href.includes("/evento/") && !a.href.includes("/administracao")
        );
        const link_sorteio = linkElement ? linkElement.href : null;
        let numero_sorteio = null;
        if (link_sorteio) {
          const match = link_sorteio.match(/\/evento\/(\d+)$/);
          if (match) {
            numero_sorteio = match[1];
          }
        }

        // Find access code
        // Try to find the element with "AccessCode" in class name
        const accessCodeElement = Array.from(
          document.querySelectorAll("div")
        ).find((div) => div.className.includes("AccessCode"));
        let codigo_acesso = null;

        if (accessCodeElement) {
          // Try to extract number from this element
          const match = accessCodeElement.innerText.match(/(\d+)/);
          if (match) codigo_acesso = match[1];
        }

        // Fallback to body text regex
        if (!codigo_acesso) {
          const bodyText = document.body.innerText;
          const codeMatch = bodyText.match(/Código de Acesso:\s*(\d+)/i);
          codigo_acesso = codeMatch ? codeMatch[1] : null;
        }

        return {
          link_sorteio,
          codigo_acesso,
          numero_sorteio,
          bodyText: document.body.innerText,
        };
      });

      if (
        result.link_sorteio &&
        result.codigo_acesso &&
        result.numero_sorteio
      ) {
        res.status(201).json({
          message: "Sorteio criado com sucesso",
          dados: {
            nome,
            email,
            link_sorteio: result.link_sorteio,
            codigo_acesso: result.codigo_acesso,
            numero_sorteio: result.numero_sorteio,
          },
        });
      } else {
        console.log("Falha na extração. Conteúdo da página:", result.bodyText);
        await page.screenshot({ path: "debug_extraction_fail.png" });
        throw new Error("Não foi possível extrair os dados do sorteio criado.");
      }
    } catch (err) {
      console.error("Erro na automação de criação:", err);
      throw err;
    } finally {
      await browser.close();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error("Erro ao criar sorteio:", error);
    res.status(500).json({ error: "Erro interno ao criar sorteio." });
  }
});

app.post("/sorteando/inscrever", async (req: Request, res: Response) => {
  try {
    const { numero_sorteio, nome, telefone, cidade, email } =
      registerSchema.parse(req.body);
    const targetUrl = `https://sorteando.vercel.app/evento/${numero_sorteio}/cadastro`;

    console.log(
      `Iniciando automação para ${nome} no sorteio ${numero_sorteio}...`
    );

    const browser = await puppeteer.launch({
      headless: false, // Mude para false se quiser ver o navegador abrindo (debug)
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--ignore-ssl-errors",
        "--allow-running-insecure-content",
        "--disable-web-security",
        "--allow-mixed-content",
        "--ignore-certificate-errors-spki-list",
        "--ignore-ssl-errors-and-warnings",
      ],
    });

    const page = await browser.newPage();

    // Configurações adicionais para HTTPS e Firebase
    await page.setExtraHTTPHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
    });

    // Permitir permissões necessárias
    await page.setDefaultNavigationTimeout(10000);
    await page.setDefaultTimeout(10000);

    // Ignorar erros de certificado na página
    page.on("response", (response) => {
      if (response.status() >= 400) {
        console.log(`Resposta HTTP ${response.status()}: ${response.url()}`);
      }
    });

    page.on("console", (msg) => {
      console.log(`Console do navegador: ${msg.text()}`);
    });

    try {
      // 1. Acessar a página
      console.log(`Acessando URL: ${targetUrl}`);
      await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      console.log("Página carregada, aguardando formulário...");

      // Aguardar a página carregar completamente, incluindo JavaScript
      await new Promise((resolve) => setTimeout(resolve, 3000));
     
      const inputNomeSelector = "#nome";
      console.log("Aguardando campo nome aparecer...");
      await page.waitForSelector(inputNomeSelector, { timeout: 15000 }); // Espera até 15s pelo input
      console.log("Campo nome encontrado, preenchendo dados...");
      await page.type("#nome", nome);
      // Para o telefone, usamos page.evaluate para contornar a máscara
      await page.evaluate((tel) => {
        const telefoneInput = document.querySelector(
          "#telefone-field input"
        ) as HTMLInputElement;
        if (telefoneInput) {
          telefoneInput.value = tel;
          // Dispara eventos para que o React/framework detecte a mudança
          telefoneInput.dispatchEvent(new Event("input", { bubbles: true }));
          telefoneInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, telefone);
      await page.type("#cidade", cidade);
      await page.type("#email", email);
      const submitButtonSelector =
        'button[type="submit"], input[type="submit"]';
      await page.waitForSelector(submitButtonSelector);
      await page.click(submitButtonSelector);

      await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {
        console.log(
          "Navegação não detectada, tentando esperar seletor de sucesso..."
        );
      });

      // @ts-ignore
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log("URL da página final:", page.url());
      console.log("Conteúdo do body da página final:", bodyText);

      // Procura por "Seu número é" e pega a próxima linha ou número
      const match =
        bodyText.match(/Seu número é\s+(\d+)/i) ||
        bodyText.match(/(\d+)\s+Boa sorte/i);
      console.log("Match:", match);
      let numeroInscricao = null;
      if (match) {
        numeroInscricao = match[1];
      } else {
        console.log("Texto da página final:", bodyText);
      }

      if (numeroInscricao) {
        console.log(`Inscrição realizada! Número: ${numeroInscricao}`);
        res.status(201).json({
          message: "Inscrição realizada com sucesso",
          dados: {
            nome,
            telefone,
            evento: numero_sorteio,
            numero_inscricao: numeroInscricao,
          },
        });
      } else {
        throw new Error(
          "Não foi possível identificar o número da inscrição na página final."
        );
      }
    } catch (err) {
      console.error("Erro durante a automação:", err);
      // Tira um screenshot para debug se falhar
      //const screenshotPath = `error_${Date.now()}.png`;
      //await page.screenshot({ path: screenshotPath });
      //console.log(`Screenshot de erro salvo em: ${screenshotPath}`);

      throw err;
    } finally {
      await browser.close();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({
      error: "Erro interno ao tentar realizar a inscrição via automação.",
    });
  }
});

interface Local {
  id: number;
  nome: string;
  endereco: string;
  logo: string;
  responsavel: string;
}


const locais: Local[] = [
  {
    id: 1,
    nome: "CRAM Maria Otávia Gonçalves de Miranda",
    endereco: "Rua Campo do Brito, 109 - 13 de Julho, Aracaju - SE, Brasil",
    logo: "https://placehold.co/100x100/purple/white?text=CRAM",
    responsavel: "Maria Otávia",
  },
  {
    id: 2,
    nome: "Secretaria da Mulher Aracaju",
    endereco: "Rua Campo do Brito, 109 - 13 de Julho, Aracaju - SE, Brasil",
    logo: "https://placehold.co/100x100/blue/white?text=SMA",
    responsavel: "Elaine Oliveira",
  },
  {
    id: 3,
    nome: "Delegacia Especial de Atendimento à Mulher (DEAM)",
    endereco: "Rua C, 120 - Santos Dumont, Aracaju - SE",
    logo: "https://placehold.co/100x100/black/white?text=DEAM",
    responsavel: "Delegada Ana Paula",
  },
  {
    id: 4,
    nome: "Defensoria Pública do Estado de Sergipe",
    endereco: "Travessa João Francisco da Silveira, 44 - Centro, Aracaju - SE",
    logo: "https://placehold.co/100x100/green/white?text=DPE",
    responsavel: "Dr. João Silva",
  },
  {
    id: 5,
    nome: "Ministério Público de Sergipe",
    endereco: "Av. Conselheiro Carlos Alberto Sampaio, 505 - Capucho, Aracaju - SE",
    logo: "https://placehold.co/100x100/red/white?text=MPSE",
    responsavel: "Dra. Carla Souza",
  },
  {
    id: 6,
    nome: "Tribunal de Justiça de Sergipe - Juizado da Violência Doméstica",
    endereco: "Rua Pacatuba, 55 - Centro, Aracaju - SE",
    logo: "https://placehold.co/100x100/orange/white?text=TJSE",
    responsavel: "Juíza Maria da Glória",
  },
  {
    id: 7,
    nome: "Casa da Mulher Brasileira",
    endereco: "Av. Maranhão, s/n - Santos Dumont, Aracaju - SE",
    logo: "https://placehold.co/100x100/pink/white?text=CMB",
    responsavel: "Fernanda Lima",
  },
  {
    id: 8,
    nome: "ONG Mulheres de Peito",
    endereco: "Rua Lagarto, 100 - Centro, Aracaju - SE",
    logo: "https://placehold.co/100x100/yellow/black?text=ONG",
    responsavel: "Roberta Santos",
  },
  {
    id: 9,
    nome: "Coordenadoria Estadual de Políticas para as Mulheres",
    endereco: "Rua Vila Cristina, 1051 - 13 de Julho, Aracaju - SE",
    logo: "https://placehold.co/100x100/cyan/black?text=CEPM",
    responsavel: "Juliana Costa",
  },
  {
    id: 10,
    nome: "Patrulha Maria da Penha - Guarda Municipal",
    endereco: "Parque da Sementeira - Jardins, Aracaju - SE",
    logo: "https://placehold.co/100x100/gray/white?text=PMP",
    responsavel: "Comandante Silva",
  },
];

app.get("/sorteando/locais", (req: Request, res: Response) => {
  res.json({data: locais});
});


app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});




app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
