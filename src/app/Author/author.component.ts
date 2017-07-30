import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import { Streamer } from './streamer';

@Component({
    selector: 'f2kOnlineStreamerTile',
    templateUrl: './online-streamer-tile.component.html',
    styleUrls: ['./online-streamer-tile.component.css']
})
export class OnlineStreamerTileComponent implements OnChanges {
    @Input() streamer: Streamer;
    @Input() moved: number;
    @Input() index: number;
    @Input() containerWidth: number;
    @Input() itemsCount: number;
    marginRight: number;
    marginLeft: number;
    spaceBetweenTiles = 10;

    @Output() currentStreamer = new EventEmitter<Streamer>();

    @HostListener('transitionend') transitioned() {
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

}
