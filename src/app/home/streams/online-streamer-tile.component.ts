import { Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Author } from '../../articles/article/author/author';

@Component({
    selector: 'f2kOnlineStreamerTile',
    templateUrl: './online-streamer-tile.component.html',
    styleUrls: ['./online-streamer-tile.component.css']
})
export class OnlineStreamerTileComponent implements OnChanges {

    @Input() streamer: Author;
    @Input() moved: number;
    @Input() index: number;
    @Input() containerWidth: number;
    @Input() itemsCount: number;
    marginRight: number;
    marginLeft: number;
    spaceBetweenTiles = 10;
    url = '';

    @HostListener('transitionend')
    transitioned() {
        this.setMargins();
        if (parseInt(this.el.nativeElement.style.left, 10) < 0) {
            const compStyle = window.getComputedStyle(this.el.nativeElement);
            const width = parseInt(compStyle.width, 10);
            this.el.nativeElement.style.transition = 'none';
            let position = (this.itemsCount - 1) * (width + this.spaceBetweenTiles) + this.marginLeft;
            if (position >= (this.containerWidth - this.marginRight) && this.containerWidth >= 768 && this.containerWidth >= 768) {
                position += 15;
            }
            this.el.nativeElement.style.left = position + 'px';
        }
    }

    constructor(private el: ElementRef) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setMargins();
        this.setPostition();

        const streamer = changes.streamer;
        if (streamer && (streamer.currentValue && streamer.currentValue.id) !== (streamer.previousValue && streamer.previousValue.id)) {
            this.url = `/team/${this.streamer.fullName.replace(' ', '_')}_${this.streamer.username}_${this.streamer.id}`;
        }
    }

    setMargins() {
        if (this.containerWidth === 1220) {
            this.marginLeft = 20;
            this.marginRight = 10;
        } else if (this.containerWidth === 768) {
            this.marginLeft = 25;
            this.marginRight = 15;
        } else {
            this.marginLeft = 15;
            this.marginRight = 0;
        }
    }

    setPostition() {
        const compStyle = window.getComputedStyle(this.el.nativeElement);
        const width = parseInt(compStyle.width, 10) + this.spaceBetweenTiles;
        if (this.containerWidth && this.itemsCount > (this.containerWidth - this.marginLeft - this.marginRight) / width) {
            let position = ((this.index * width) - (this.moved * width)) % (this.itemsCount * width);
            this.el.nativeElement.style.left = position + 'px';
            if (position < -width) {
                position += this.itemsCount * width;
            }
            this.el.nativeElement.style.opacity = 1;
            position += position % width * 10;
            position += this.marginLeft;
            if (position >= (this.containerWidth - this.marginRight)) {
                position += 15;
            }
            this.el.nativeElement.style.transition = 'left 600ms linear';
            this.el.nativeElement.style.left = position + 'px';
        } else {
            this.el.nativeElement.style.opacity = 1;
            let position = this.index * width + this.marginLeft;
            if (position >= (this.containerWidth - this.marginRight) && this.containerWidth >= 768) {
                position += 15;
            }
            this.el.nativeElement.style.left = position + 'px';
        }
    }
}
