import { Component, Input, OnInit } from '@angular/core';
import { Author } from '../../articles/article/author/author';

@Component({
    selector: 'f2kMemberTile',
    templateUrl: './player-tile.component.html',
    styleUrls: ['./player-tile.component.css']
})
export class PlayerInstanceComponent implements OnInit{

    @Input() user: Author;
    url = '';

    ngOnInit(): void {
        this.url = `${this.user.fullName.replace(' ', '_')}_${this.user.username}_${this.user.id}`;
    }
}
