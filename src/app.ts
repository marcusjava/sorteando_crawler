import express, { Application } from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { initializeFirebase } from "./config/firebase.config";

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeFirebase();
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  private initializeFirebase(): void {
    initializeFirebase();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(requestLogger);
  }

  private routes(): void {
    this.app.use(routes);
  }

  private errorHandling(): void {
    this.app.use(errorHandler);
  }
}
