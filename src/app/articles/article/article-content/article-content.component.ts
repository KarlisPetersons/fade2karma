import { Component, OnInit, Input, Inject, ViewEncapsulation, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Article } from '../../article';
import { DomSanitizer} from '@angular/platform-browser';
import { BASE_URL } from '../../../core/globals';

@Component({
    selector: 'f2kArticleContent',
    templateUrl: './article-content.component.html',
    styleUrls: ['./article-content.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ArticleContentComponent implements OnInit {

    @Input() article: Article;
    @Input() articles: Article[];
    CONTENT: any;
    height: any;
    facebookComments = false;
    showComments = false;
    commentUrl: string;

    @ViewChild('articleBody') articleBody: ElementRef;
    @ViewChild('recommendedTeaser') recommendedTeaser: ElementRef;
    @ViewChild('socialShare') socialShare: ElementRef;
    @HostListener('window:scroll', ['$event'])
    // TODO: while scrolling up, start scrolling when hits viewport bottom
    onScroll(event) {
      // Maximum translation distance for recommended teaser
      let maxDistance = this.articleBody.nativeElement.clientHeight
                        - this.recommendedTeaser.nativeElement.offsetHeight;
      // Translation distance for recommended teaser
      let distance = - this.articleBody.nativeElement.getBoundingClientRect().top // distance from viewport top
                     + this.docEl.getElementsByTagName('f2knavigation')[0]['offsetHeight']
                     + parseInt(this.docEl.getElementsByTagName('f2knavigation')[0]['style']['top'])
                     + 20; // extra 20 px margin
      // Teaser limits
      distance = distance < 0 ? 0 : distance;
      distance = distance > maxDistance ? maxDistance : distance;
      if (parseInt(this.articleBody.nativeElement.getBoundingClientRect().width, 10) !== 780) { // TODO better fix for only doing this in window width more then 1220px
          distance = 0
      }
      this.recommendedTeaser.nativeElement.style.transform = 'translateY(' + distance + 'px)';

      // Maximum translation distance for social share element
      maxDistance = this.articleBody.nativeElement.clientHeight
                        - this.socialShare.nativeElement.offsetHeight
                        - 40; // top margin of social share element
      // Translation distance for social share element
      distance = - this.articleBody.nativeElement.getBoundingClientRect().top // distance from viewport top
                     + this.docEl.getElementsByTagName('f2knavigation')[0]['offsetHeight']
                     + parseInt(this.docEl.getElementsByTagName('f2knavigation')[0]['style']['top']);
      // Social share element limits
      distance = distance < 0 ? 0 : distance;
      distance = distance > maxDistance ? maxDistance : distance;
        if (parseInt(this.articleBody.nativeElement.getBoundingClientRect().width, 10) !== 780) { // TODO better fix for only doing this in window width more then 1220px
            distance = 0
        }
      this.socialShare.nativeElement.style.transform = 'translateY(' + distance + 'px)';
    }
    constructor(@Inject(DOCUMENT) private docEl: Document,private sanitizer: DomSanitizer, private el: ElementRef) { }

	@HostListener('window:resize', ['$event.target']) onResize() {
		this.resizeWorks();
	}

	private resizeWorks(): void {
		this.height = this.el.nativeElement.width * 0.667;
	}

    ngOnInit() {
        this.commentUrl = `${BASE_URL}/articles/${this.article.title.replace(/ /g, '_').replace(/[^a-zA-Z0-9;,+*()\'$!-._~?/]/g, '').toLowerCase()}`;

        if (this.article.imageURL && (this.article.imageURL.indexOf('youtube') !== -1 || this.article.imageURL.indexOf('twitch') !== -1)) {
			 this.CONTENT = this.sanitizer.bypassSecurityTrustHtml("<iframe src='" + this.article.imageURL+"'  allowfullscreen></iframe>" + this.article.content);
        } else if (this.article.imageURL) {
            this.CONTENT = this.sanitizer.bypassSecurityTrustHtml(`<img src="${this.article.imageURL.indexOf('http') !== -1 ? this.article.imageURL : 'assets/images/' + this.article.imageURL}">${this.article.content}`);
        } else {
            this.CONTENT = this.sanitizer.bypassSecurityTrustHtml(this.article.content);
        }
    }
}
