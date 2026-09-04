import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { OpenAPI } from 'api-client';

// Configure the base URL to point directly to the scribe-service
OpenAPI.BASE = 'http://localhost:4001';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
