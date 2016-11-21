import React from 'react';
import CONFIG from '../config';

import Header from './header';
import Dashboard from './dashboard';
import List from './list';

import SystemStore from '../stores/systems-store';

require('../css/main.less');

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: true,
            loadError: false,
            authenticationError: false,
            data: []
        };
        this.handleUpdate = () => {
            this.setState({
                data: SystemStore.getData()
            });
        };
    }
    componentDidMount() {
        SystemStore.authenticate().then((res) => {
            SystemStore.load().then((res) => {
                this.setState({
                    isLoading: false,
                    data: res
                });
            }, () => {
                this.setState({
                    isLoading: false,
                    loadError: true
                });
            });
        }, () => {
            this.setState({
                isLoading: false,
                authenticationError: true
            });
        });
        SystemStore.on('update', this.handleUpdate);
    }
    componentWillUnmount() {
        SystemStore.removeListener('update', this.handleUpdate);
    }

    render() {
        const { isLoading, loadError, authenticationError, data } = this.state;
        if (isLoading) {
            return <div className="banner"><img src={require("../img/preloader.gif")} alt="загрузка"/></div>;
        }
        if (authenticationError) {
            return <div className="banner">Ошибка авторизации</div>;
        }
        return (
            <div className="main-wrapper">
                <Header />
                <div className="main-content">
                    <div>
                        <Dashboard data={data} />
                    </div>
                    <div>
                        <List data={data} />
                    </div>
                </div>
            </div>
        );
    }
}