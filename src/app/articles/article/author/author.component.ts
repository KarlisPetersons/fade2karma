import {
    Component,
    Input, OnInit
} from '@angular/core';
import { Author} from './author';

@Component({
    selector: 'f2kAuthorTile',
    templateUrl: './author.component.html',
    styleUrls: ['./author.component.css']
})
export class AuthorComponent implements OnInit {

    @Input() author: Author;
    @Input() player?: String | null;

    url = '';

    ngOnInit(): void {
        this.url = `/team/${this.author.fullName.replace(' ', '_')}_${this.author.username}_${this.author.id}`;
    }
}
