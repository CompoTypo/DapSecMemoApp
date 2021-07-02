import { Component } from '@angular/core';
import {
  faChevronLeft,
  faChevronUp,
  faChevronDown,
  faCog,
  faEdit,
  faPlus,
  faSave,
  faDownload,
  faUpload,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, Validators } from '@angular/forms';
import { RequestsService } from './services/requests.service';
import { AuthService } from './services/auth.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // FA Icons
  plus = faPlus;
  save = faSave;
  chevronLeft = faChevronLeft;
  chevronDown = faChevronDown;
  chevronUp = faChevronUp;
  cog = faCog;
  edit = faEdit;
  download = faDownload;
  upload = faUpload;
  times = faTimes;
  trash = faTrash;

  signinForm = this.fb.group({
    user_name: [''],
    password: [''],
  });

  signupForm = this.fb.group({
    user_name: [''],
    password: [''],
    password2: [''],
    email: ['', Validators.required],
  });

  createForumForm = this.fb.group({
    forum_name: [''],
    visibility: ['']
  });

  joinForumForm = this.fb.group({
    forum_input: ['']
  })

  createPageForm = this.fb.group({
    page_name: [''],
    viewership: [''],
    authorship: ['']
  })

  editForumForm = this.fb.group({
    forum_name: [''],
    visibility: ['']
  });



  // State booleans
  isLoggedIn: boolean;
  showSigningInModal: boolean;
  showSigningUpModal: boolean;
  showAddingForumModal: boolean;
  showForumSettingsModal: boolean;
  showAddingPageModal: boolean;

  showJoinForumForm: boolean;
  showCreateForumForm: boolean;
  showForumSettingsForm: boolean;
  showForumRankSettingsForm: boolean;
  showForumUserSettingsForm: boolean;
  showForumPageSettingsForm: boolean;
  editingForumPageSettingIndex: number;

  showAddRankInput: boolean;

  selectedForumIndex: number;
  selectedJoinForumId: number;
  selectedPageIndex: number;
  searchResults: [];
  user: any;

  constructor(
    private fb: FormBuilder,
    private req: RequestsService,
    private auth: AuthService) {
    this.isLoggedIn = false;
    this.showSigningInModal = false;
    this.showSigningUpModal = false;
    this.selectedForumIndex = -1;
    this.selectedJoinForumId = -1;
    this.selectedPageIndex = -1;
    this.showAddRankInput = false;
    this.editingForumPageSettingIndex = -1;
  }

  ngOnInit() {
    if (this.auth.getToken()) {
      this.isTokenValid();
      this.user = this.auth.getDecodedToken();
    }
  }

  isTokenValid() {
    console.log("Validating token")
    if (this.auth.isExpiredToken()) {
      this.signOut();
      return false
    }
    this.isLoggedIn = true;
    return true;
  }

  openSignInModal() {
    console.log('open sign in')
    this.showSigningInModal = true;
    this.showSigningUpModal = false;
  }

  closeSignInModal() {
    console.log('close sign in')
    this.showSigningInModal = false;
  }

  showCreateForum() {
    this.showCreateForumForm = true;
    this.showJoinForumForm = false;
  }

  showJoinForum() {
    this.showCreateForumForm = false;
    this.showJoinForumForm = true;
  }

  signOut() {
    this.auth.deleteToken();
    this.isLoggedIn = false;
  }

  swapAndSortRanks(i: number, j: number) {
    [
      this.user.forums[this.selectedForumIndex].ranks[i].rank_name,
      this.user.forums[this.selectedForumIndex].ranks[j].rank_name
    ] = [
        this.user.forums[this.selectedForumIndex].ranks[j].rank_name,
        this.user.forums[this.selectedForumIndex].ranks[i].rank_name
      ]
  }


  addForum() {
    if (!this.isTokenValid()) return;
    this.showAddingForumModal = true;
  }

  editForum() {
    this.showForumSettingsForm = true;
    this.showForumRankSettingsForm = false;
    this.showForumUserSettingsForm = false;
    this.showForumPageSettingsForm = false;
  }
  editForumRanks() {
    this.getForumRanks(this.user.forums[this.selectedForumIndex].id);
    this.showForumSettingsForm = false;
    this.showForumRankSettingsForm = true;
    this.showForumUserSettingsForm = false;
    this.showForumPageSettingsForm = false;
  }
  editForumUsers() {
    this.getForumUsers(this.user.forums[this.selectedForumIndex].id);
    this.showForumSettingsForm = false;
    this.showForumRankSettingsForm = false;
    this.showForumUserSettingsForm = true;
    this.showForumPageSettingsForm = false;
  }
  editForumPages() {
    this.getPages(this.user.forums[this.selectedForumIndex].id);
    this.showForumSettingsForm = false;
    this.showForumRankSettingsForm = false;
    this.showForumUserSettingsForm = false;
    this.showForumPageSettingsForm = true;
  }

  submitSignIn() {
    this.closeSignInModal();
    this.req.send("POST", '/account/login',
      {
        body: this.signinForm.value
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
          this.isLoggedIn = true;
        },
        err => {
          console.error(err);
          this.isLoggedIn = false;
        }
      );
  }

  submitSignUp() {
    this.showSigningUpModal = false;
    this.req.send("POST", '/account/register',
      {
        body: this.signupForm.value
      })
      .subscribe(
        response => {
          console.log(response);
        },
        err => {
          console.error(err);
        },
        () => { }
      );
  }
  submitCreateForumForm() {
    this.showCreateForum();
    this.req.send("POST", '/forum/create',
      {
        token: this.auth.getToken(),
        body: {
          forum: this.createForumForm.value,
        }
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
          console.log(this.user);
          this.showAddingForumModal = false;
        },
        err => {
          console.error(err);
        },
      );
  }

  submitJoinForum(forum_tag: string) {
    let [forum_name, forum_id] = forum_tag.split('#');
    console.log(forum_name, forum_id);
    this.req.send("POST", '/forum/join/' + forum_id,
      {
        token: this.auth.getToken()
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
          console.log(this.user);
          this.showAddingForumModal = false;
        },
        err => {
          console.error(err);
        },
      );
  }

  addPage() {
    if (!this.isTokenValid()) return;
    this.showAddingPageModal = true
    this.getForumRanks(this.user.forums[this.selectedForumIndex].id)
  }

  getForumRanks(forum_id: number) {
    this.req.send("GET", "/forum/" + forum_id + "/ranks",
      {
        token: this.auth.getToken()
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
        },
        err => {
          console.error(err);
        }
      )
  }

  getMatchingForums(forum_metadata: string) {
    this.req.send("POST", '/forum/search',
      {
        body: {
          metadata: forum_metadata
        }
      })
      .subscribe(
        response => {
          this.searchResults = response['body']['searched_forums'];
          console.log(this.searchResults)
        },
        err => {
          console.error(err);
        }
      )
  }

  submitEditForumForm(forum_id) {
    this.req.send("POST", '/forum/' + forum_id + "/edit",
      {
        token: this.auth.getToken(),
        body: {
          forum: this.editForumForm.value,
        }
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
          console.log(this.user);
        },
        err => {
          console.error(err);
        },
      );
  }

  addRank(rank) {
    let rank_value = this.user.forums[this.selectedForumIndex].ranks.length + 1;
    this.user.forums[this.selectedForumIndex].ranks.push({ rank_name: rank, rank_value: rank_value });
    console.log('ranks edit: ', this.user.forums[this.selectedForumIndex].ranks);
  }

  getForumUsers(forum_id: number) {
    this.req.send("GET", "/forum/" + forum_id + "/users",
      {
        token: this.auth.getToken()
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
          console.log(this.user.forums);
        },
        err => {
          console.error(err);
        }
      )
  }

  submitForumRankEdits() {
    this.req.send("POST", '/forum/' + this.user.forums[this.selectedForumIndex].id + "/ranks/edit",
      {
        token: this.auth.getToken(),
        body: {
          ranks: this.user.forums[this.selectedForumIndex].ranks,
        }
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
          console.log(this.user);
        },
        err => {
          console.error(err);
        },
      );
  }


  getPages(forum_id) {
    this.req.send("GET", '/forum/' + forum_id,
      {
        token: this.auth.getToken()
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
        },
        err => {
          console.error(err);
        },
      );
  }

  submitCreatePageForm(forum_id) {
    console.log(this.createPageForm.value);
    this.req.send("POST", '/forum/' + forum_id + '/page/create',
      {
        token: this.auth.getToken(),
        body: {
          page: this.createPageForm.value,
        }
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
        },
        err => {
          console.error(err);
        },
      )
  }

  promoteUser(user_id, forum_id) {
    console.log(user_id)
    this.req.send("POST", '/forum/' + forum_id + '/users/' + user_id + '/promote',
      {
        token: this.auth.getToken()
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
          console.log(this.user);
        },
        err => {
          console.error(err);
        }
      )
  }
  demoteUser(user, forum_id) { }

  submitEditPage(page_id, min_viewer_rank, min_author_rank) {
    console.log(page_id, min_viewer_rank, min_author_rank);
    this.req.send("POST", '/forum/' + this.user.forums[this.selectedForumIndex].id + '/page/' + page_id + '/edit',
      {
        token: this.auth.getToken(),
        body: {
          min_read_rank_id: min_viewer_rank,
          min_write_rank_id: min_author_rank
        }
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
        },
        error => {
          console.error(error);
        }
      )
  }

  getMessages(forum_id, page_id) {
    this.req.send("GET", '/forum/' + forum_id + '/page/' + page_id,
      {
        token: this.auth.getToken()
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
        },
        err => {
          console.error(err);
        },
      )
  }

  submitMessage(text: string) {
    let forum_id = this.user.forums[this.selectedForumIndex].id;
    let page_id = this.user.forums[this.selectedForumIndex].pages[this.selectedPageIndex].id;
    this.req.send("POST", '/forum/' + forum_id + '/page/' + page_id + '/message',
      {
        token: this.auth.getToken(),
        body: {
          message: { text: text, user_id: this.user.id },
        }
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
        },
        err => {
          console.error(err);
        },
      )
  }

  deleteForum(forum_id) {
    this.req.send("POST", '/forum/' + forum_id + '/delete',
      {
        token: this.auth.getToken(),
      })
      .subscribe(
        response => {
          this.auth.setToken(response['body']['token']);
          this.user = this.auth.getDecodedToken();
        },
        err => {
          console.error(err);
        }
      )
  }

}
