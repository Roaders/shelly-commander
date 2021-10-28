import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { getRegisteredTypesWithFactories } from '@morgan-stanley/needle';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import packageJson from '../package.json';

window.document.title = `Shelly Commander ${packageJson.version}`;

if (environment.production) {
    enableProdMode();
}

const providers = getRegisteredTypesWithFactories();

platformBrowserDynamic(providers)
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
