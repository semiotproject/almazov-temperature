import { Router, IndexRoute, Route, Link, browserHistory } from 'react-router';
import ReactDOM from 'react-dom';
import React from 'react';

import Main from './components/main';
import List from './components/list';
import CONFIG from './config';

import SystemStore from './stores/systems-store';

SystemStore.authenticate().then(() => {
    SystemStore.load().then(() => {
        ReactDOM.render(
            <Router history={browserHistory}>
                <Route path={CONFIG.baseURL}>
                    <IndexRoute component={Main}/>
                    <Route path="list" component={List} />
                </Route>
            </Router>,
            document.querySelector('#root')
        );
    });
});

