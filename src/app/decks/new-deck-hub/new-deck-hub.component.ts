import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Deck, DeckObj, TopLegendDeck } from '../deck';
import Card from '../../card';
import { DustCalculationService } from '../../core/dust-calculation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BASE_URL} from '../../core/globals';
import { DomSanitizer } from '@angular/platform-browser';
import { FacebookSkdService } from '../../facebook-skd.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { HoverService } from '../../core/hover.service';
import { SpoilerService } from '../../core/spoilers';
import { CopyDeckCodeService } from '../../core/copy-deck-code.service';

@Component({
    selector: 'f2kNewDeckHub',
    templateUrl: './new-deck-hub.component.html',
    styleUrls: ['./new-deck-hub.component.css']
})
export class NewDeckHubComponent implements OnDestroy {

    deck: Deck | TopLegendDeck;
    chartData: any;
    leftColumn: Array<{ title: string, cards: Array<Card> }> = [];
    rightColumn: Array<{ title: string, cards: Array<Card> }> = [];
    displayedCard: string;
    CONTENT: any;
    routeSubscription: any;
    facebookComments = false;
    showComments = false;
    commentUrl: string;
    previousSize: number;
    activeDeck: DeckObj;
    subscriptions: Array<Subscription> = [];

    copyDeckCodeName = 'COPY DECK CODE';

    distribution: { [key: string]: number };

    @ViewChild('contentContainer') contentContainer: ElementRef;
    @ViewChild('commentContainer') commentContainer: ElementRef;
    @ViewChild('cardsContainers') cardsContainers: ElementRef;

    static sortByManaCostAndName(a: Card, b: Card) {
        const sortValue = a.cost - b.cost;

        if (sortValue === 0) {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        }

        return sortValue;
    }

    constructor(private http: HttpClient,
                private router: Router,
                private route: ActivatedRoute,
                private sanitizer: DomSanitizer,
                private facebookService: FacebookSkdService,
                private cdRef: ChangeDetectorRef,
                private hoverService: HoverService,
                private spoilerService: SpoilerService,
                private copyDeckCodeService: CopyDeckCodeService) {
        this.routeSubscription = this.route.params.subscribe(() => {
            this.deck = null;
            this.chartData = null;
            this.leftColumn = [];
            this.rightColumn = [];
            this.displayedCard = null;
            this.CONTENT = '';

            this.getDeck(parseInt(this.router.url.slice(this.router.url.lastIndexOf('_') + 1), 10));
        });
    }

    @HostListener('window:resize', ['$event.target'])
    onResize() {
        if (this.previousSize && this.commentContainer.nativeElement.clientWidth !== this.previousSize) {
            this.parseHTML(true);
        }
    }

    parseHTML(forceResize?: boolean): void {
        if (this.facebookService.fb) {
            if (!this.facebookComments || forceResize) {
                this.facebookComments = true;
                this.previousSize = this.commentContainer.nativeElement.clientWidth;
                this.commentContainer.nativeElement.innerHTML = `<div class="fb-comments" data-href="${BASE_URL}/decks/${this.deck.id}" data-width="${this.previousSize}" data-numposts="5"></div>`;
                this.facebookService.fb.XFBML.parse(this.commentContainer.nativeElement);
            }
        }
    }

    getSpecificCards(deck: DeckObj, param: string, value: any, equils = true) {
        const cards: Array<Card> = [];
        deck.cards.forEach(card => {
            if ((equils ? card[param] === value : card[param] !== value)) {
                let c;

                for (let i = 0; i < cards.length; i++) {
                    if (cards[i].dbId === card.dbId) {
                        c = cards[i];
                        break;
                    }
                }

                if (c) {
                    ++c.amount;
                } else {
                    card.amount = 1;
                    cards.push(card);
                }
            }
        });
        return cards.sort(NewDeckHubComponent.sortByManaCostAndName);
    }

    getCardAmount(cards: Array<Card>) {
        return cards.reduce((acc, card) => { return acc += card.amount; }, 0);
    }

    buildData() {
        this.leftColumn = [];
        this.rightColumn = [];

        let deckMode: string;
        if (this.deck.mode === 'CON') {
            if (this.deck.isStandard) {
                deckMode = 'standard';
            } else {
                deckMode = 'wild';
            }
        }

        if (this.deck.game === 'HS') {
            this.distribution = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7+': 0 };
            this.activeDeck.cards.forEach((card: Card) => {
                this.distribution[(card.cost >= 7 ? '7+' : `${card.cost}`)] += 1;
            });
            this.leftColumn.push({
                title: 'Class Cards',
                cards: this.getSpecificCards(this.activeDeck, 'heroClass', 'NEUTRAL', false)
            });
            this.rightColumn.push({
                title: 'Neutral Cards',
                cards: this.getSpecificCards(this.activeDeck, 'heroClass', 'NEUTRAL')
            });
        } else {
            this.distribution = null;
            const leaderCard = new Card(this.deck.leader);
            leaderCard.rarity = 'LEGENDARY';
            leaderCard.positions = ['EVENT'];
            this.leftColumn.push({ title: 'Leader', cards: [leaderCard] });

            const goldCards = this.getSpecificCards(this.activeDeck, 'group', 'GOLD');
            this.leftColumn.push({ title: 'Gold x ' + this.getCardAmount(goldCards), cards: goldCards });

            const silverCards = this.getSpecificCards(this.activeDeck, 'group', 'SILVER');
            this.leftColumn.push({ title: 'Silver x ' + this.getCardAmount(silverCards), cards: silverCards });

            const bronzeCards = this.getSpecificCards(this.activeDeck, 'group', 'BRONZE');
            this.rightColumn.push({ title: 'Bronze x ' + this.getCardAmount(bronzeCards), cards: bronzeCards });
        }

        this.chartData = {
            metadata: [
                {
                    label: this.deck.game === 'HS' ? 'Class' : 'Faction',
                    value: this.deck.game === 'HS' ? this.deck.heroClass.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : this.deck.faction.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                    image: this.deck.game === 'HS' ? `assets/Hearthstone_Square/${this.deck.heroClass.toLowerCase()}.jpg` : `assets/icons/${this.deck.faction.replace('\'', '-').replace(' ', '').toLowerCase()}.svg`,
                    imageStyle: { 'padding-bottom': '4px' }
                },
                {
                    label: this.deck.game === 'HS' ? 'Game mode' : 'Leader',
                    value: this.deck.game === 'HS' ? deckMode.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : this.deck.leader.name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                    image: this.deck.game === 'HS' ? `assets/icons/${deckMode.toLowerCase()}icon.svg` : `assets/GwentLeaders_Square/${this.deck.leader.name.replace('\'', '-').replace(' ', '').toLowerCase()}.jpg`,
                    imageStyle: { 'padding-bottom': '5px' }
                },
                {
                    label: this.deck.game === 'HS' ? 'Dust Cost' : 'Scrap',
                    value: DustCalculationService.getCardCost(this.activeDeck.cards, this.deck.game),
                    image: this.deck.game === 'HS' ? 'assets/icons/icon-dust.png' : 'assets/icons/icon-scrap.png',
                    imageStyle: { 'padding-bottom': '5px' }
                }
            ],
            distribution: this.distribution
        };
    }

    getDeck(id: number) { // TODO move in service, handle errors in case they take place...
        const topSpotlightDeck = this.router.url.indexOf('top_25_spotlight') > -1;
        this.subscriptions.push(this.http.get<Deck | TopLegendDeck>(`${BASE_URL}/api/${topSpotlightDeck ? 'topdecks' : 'decks'}/${id}`).subscribe(deck => {

            this.deck = deck;
            this.deck.content = this.deck.content ? this.deck.content.replace(/<span class="f2kHoverCard(.*?)>(.*?)<\/span>([a-zA-Z']+)/gi, '<span class="f2kHoverCard$1>$2$3</span>') : '';
            this.activeDeck = topSpotlightDeck ? (<any>this.deck).deck : this.deck.decks[0];

            this.CONTENT = this.sanitizer.bypassSecurityTrustHtml(`${this.deck.content}`);
            this.commentUrl = `${BASE_URL}/${topSpotlightDeck ? 'top_25_spotlight' : 'tier_list'}/${this.deck.title.replace(/ /g, '_').replace(/[:<>;,+*()'$!-.~?/]/g, '').toLowerCase()}`;
            this.buildData();
            this.cdRef.detectChanges();
            this.hoverService.initTextCardHover(this.cardsContainers.nativeElement);
            this.hoverService.initTextCardHover(this.contentContainer.nativeElement);
            this.spoilerService.initSpoilers(this.contentContainer.nativeElement);
            this.copyDeckCodeService.initDeckCodeCopy(this.contentContainer.nativeElement);
        }));
    }

    copyDeckCode(deckCode?: string): void {
        this.copyDeckCodeService.copyDeckCode(deckCode || this.activeDeck.code);
        this.copyDeckCodeName = '✔ DECK CODE COPIED';
        setTimeout(() => { this.copyDeckCodeName = 'COPY DECK CODE'; }, 5000);
    }

    onDeckChange(newDeck: DeckObj): void {
        this.activeDeck = newDeck;
        this.buildData();
        this.cdRef.detectChanges();
        this.hoverService.initTextCardHover(this.cardsContainers.nativeElement);
    }

    ngOnDestroy() {
        this.routeSubscription.unsubscribe();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
