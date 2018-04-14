import { Injectable } from '@angular/core';
import { HoverService } from './hover.service';
import { CopyDeckCodeService } from './copy-deck-code.service';

const COLLAPSED_CLASS = 'collapsed';
const EXPANDED_CLASS = 'expanded';

@Injectable()
export class SpoilerService {
    constructor(private hoverService: HoverService, private copyDeckCodeService: CopyDeckCodeService) {}

    initSpoilers(containerElement: HTMLElement): void {
        const spoilerElements = containerElement.querySelectorAll<HTMLSpanElement>('.f2kSpoiler');
        for (let i = 0; i < spoilerElements.length; i++) {
            const clickEl = document.createElement('span');

            const spoilerElement = spoilerElements[i];
            const index = Array.prototype.indexOf.call(containerElement.children, spoilerElement);
            const content = spoilerElement.innerHTML;
            const title = containerElement.children[index - 1];
            this.toggleSpoiler(spoilerElement, clickEl, content);

            spoilerElement.className = `${spoilerElement.className} f2k_clickable`;

            if (title) {
                title.className = `${title.className} f2k_clickable`;
                title.addEventListener('click', () => {
                    this.toggleSpoiler(spoilerElement, clickEl, content);
                });
            }

            clickEl.addEventListener('click', () => {
                this.toggleSpoiler(spoilerElement, clickEl, content);
            });
        }
    }

    toggleSpoiler(el: HTMLSpanElement, clickEl: HTMLSpanElement, initialContent: string): void {
        if (el.className.indexOf(COLLAPSED_CLASS) !== -1) {
            el.className = el.className.replace(COLLAPSED_CLASS, EXPANDED_CLASS);
            el.innerHTML = initialContent;
            clickEl.innerHTML = '[-]';
            this.hoverService.initTextCardHover(el);
            this.copyDeckCodeService.initDeckCodeCopy(el);
        } else {
            el.className = el.className.indexOf(EXPANDED_CLASS) !== -1 ? el.className.replace(EXPANDED_CLASS, COLLAPSED_CLASS) : `${el.className} ${COLLAPSED_CLASS}`;
            el.innerHTML = '';
            clickEl.innerHTML = '[+]';
        }
        el.insertBefore(clickEl, el.childNodes[0]);
    }
}
