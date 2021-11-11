import { Injectable } from '@morgan-stanley/needle';
import { defaultUrlTemplate, urlTemplateStorageKey } from '../constants';

@Injectable()
export class URLTemplateService {
    public get templateUrl(): string {
        return window.localStorage.getItem(urlTemplateStorageKey) || defaultUrlTemplate;
    }

    public set templateUrl(value: string) {
        window.localStorage.setItem(urlTemplateStorageKey, value);
    }
}
