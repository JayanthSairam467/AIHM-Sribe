import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { OpenAPI } from 'api-client';

// Configure the base URL for the generated API Client
OpenAPI.BASE = 'http://localhost:4000/api/v1';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
