import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideHttpClient,
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ErrorInterceptor } from './app/core/interceptors/error-interceptor.service';

// 🌐 Factory function to create a loader that loads translation JSON files
export function HttpLoaderFactory(http: HttpClient) {
  // This tells ngx-translate where to find translation JSON files (assets/i18n/*.json)
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// 🚀 Bootstrapping the Angular standalone app with all required providers
bootstrapApplication(AppComponent, {
  // Spread any global providers from appConfig (like routing etc)
  ...appConfig,

  // Define additional dependency injection providers
  providers: [
    // Include any providers from appConfig (to avoid overwriting)
    ...(appConfig.providers || []),

    // Provide Angular's HttpClient with interceptors loaded from DI container
    // This allows interceptors like AuthInterceptor to be used automatically
    provideHttpClient(withInterceptorsFromDi()),

    // Import and configure ngx-translate module for i18n support
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          // Use custom loader factory function defined above
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient], // Inject HttpClient to loader
        },
      })
    ),

    // Register the HTTP interceptor that adds Authorization header to requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, // Important: allows multiple interceptors
    },

    // Register the Error interceptor that handles API errors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true, // Important: allows multiple interceptors
    },

    // Provide Angular animations support asynchronously for better performance
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err)); // Log bootstrap errors to console
