import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { switchMap, map } from 'rxjs/operators';
import { empty } from 'rxjs/observable/empty';

import { User, Question, RouterStateUrl } from '../../../model';
import { UserActions, UserActionTypes } from '../actions';
import * as userActions from '../actions/user.actions';
import { UserService, QuestionService } from '../../../core/services';

@Injectable()
export class UserEffects {
    // Save user profile
    @Effect()
    addUser$ = this.actions$
        .ofType(UserActionTypes.ADD_USER_PROFILE)
        .pipe(
        switchMap((action: userActions.AddUserProfile) => {
            this.userService.saveUserProfile(action.payload.user);
            return empty();
        })
        );

    // load user by userId
    @Effect()
    loadUserProfile$ = this.actions$
        .ofType(UserActionTypes.LOAD_USER_PROFILE)
        .pipe(
        switchMap((action: userActions.LoadUserProfile) =>
            this.userService.getUserProfile(action.payload.user).pipe(
                    map((user: User) => new userActions.LoadUserProfileSuccess(user)))
            )
        );

      // listening for login success from root to load user profile
      @Effect()
      loginSuccess$ = this.actions$
          .ofType(UserActionTypes.LOGIN_SUCCESS)
          .map((action: any) => action.payload)
          .map( user => new userActions.LoadUserProfile( { user }));


    // Load User Published Question by userId from router
    @Effect()
    // handle location update
    loadUserPublishedRouteQuestions$ = this.actions$
        .ofType('ROUTER_NAVIGATION')
        .map((action: any): RouterStateUrl => action.payload.routerState)
        .filter((routerState: RouterStateUrl) =>
            routerState.url.toLowerCase().startsWith('/my/questions') &&
            routerState.params.userid
        )
        .pipe(
        switchMap((routerState: RouterStateUrl) =>
            this.questionService.getUserQuestions(routerState.params.userid, true).pipe(
                map((questions: Question[]) => new userActions.LoadUserPublishedQuestionsSuccess(questions))
            )
        )
        );

    // Load User Unpublished Question by userId from router
    @Effect()
    // handle location update
    loadUserUnpublishedRouteQuestions$ = this.actions$
        .ofType('ROUTER_NAVIGATION')
        .map((action: any): RouterStateUrl => action.payload.routerState)
        .filter((routerState: RouterStateUrl) =>
            routerState.url.toLowerCase().startsWith('/my/questions') &&
            routerState.params.userid
        )
        .pipe(
        switchMap((routerState: RouterStateUrl) =>
            this.questionService.getUserQuestions(routerState.params.userid, false).pipe(
                map((questions: Question[]) => new userActions.LoadUserUnpublishedQuestionsSuccess(questions))
            )
        )
        );


    // Add Question
    @Effect()
    addQuestion$ = this.actions$
        .ofType(UserActionTypes.ADD_QUESTION)
        .pipe(
        switchMap((action: userActions.AddQuestion) => {
            this.questionService.saveQuestion(action.payload.question);
            return empty();
        })
        );
    constructor(
        private actions$: Actions,
        private userService: UserService,
        private questionService: QuestionService
    ) { }
}