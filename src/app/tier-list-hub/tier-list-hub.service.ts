import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { BASE_URL } from '../core/globals';
import { Deck, Games, HeroClasses } from '../decks/deck';
import { DustCalculationService } from '../core/dust-calculation.service';

@Injectable()
export class TierListHubService {

    constructor(private http: Http) {
    }

    getDecks(amount: number, tier: number, mode: string, isStandard: boolean | null, game: Games, classes: Array<HeroClasses> = [], offset?: number) {
        const url = `${BASE_URL}/api/decks/list?amount=${amount}${tier === 0 ? '' : '&tier=' + tier}${mode ? '&mode=' + mode : ''}${isStandard != null ? '&isStandard=' + isStandard : ''}${game !== 'UNDEFINED' ? '&game=' + game : ''}${classes.length ? '&classes=' + classes.join(',') : ''}${offset ? '&offset=' + offset : ''}`;
        return this.http.get(url)
            .toPromise()
            .then(response => {
                const res: Array<Deck> = response.json();
                for (let i = 0; i < res.length; i++) {
                    res[i].dust = DustCalculationService.getCardCost(res[i].cards, res[i].game);
                }
                return res;
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
