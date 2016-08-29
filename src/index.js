const { Router, IndexRoute, Route, Link, browserHistory } = ReactRouter;

import Main from './components/main';
import List from './components/list';
import CONFIG from './config';

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path={CONFIG.baseURL}>
            <IndexRoute component={Main}/>
            <Route path="list" component={List} />
        </Route>
    </Router>,
    document.querySelector('#root')
);