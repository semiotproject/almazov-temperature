import SystemStore from '../stores/systems-store';
import api from '../api/';
import CONFIG from '../config';

const { Link } = ReactRouter;

require('../css/main.less');

export default class Main extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: true,
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
        api.authenticate().then(() => {
            SystemStore.load().then((res) => {
                this.setState({
                    isLoading: false,
                    data: res
                });
            });
            SystemStore.on('update', this.handleUpdate);
        }, () => {
            this.setState({
                authenticationError: true,
                isLoading: false
            });
        });
    }
    componentWillUnmount() {
        SystemStore.removeListener('update', this.handleUpdate);
    }

    renderMin(data) {
        let min = {
            temperature: Infinity
        };
        data.forEach((d) => {
            if (d.temperature < min.temperature) {
                min = d;
            }
        });
        return [
            <span>{min.temperature} {String.fromCharCode("8451")}</span>,
            <label>минимальная температура</label>,
            <label>в комнате № {min.room}</label>
        ];
    }
    renderAverage(data) {
        return (data.reduce((prev, next) => {
            return prev + next.temperature;
        }, 0) / data.length).toFixed(2);
    }
    renderMax(data) {
        let max = {
            temperature: -Infinity
        };
        data.forEach((d) => {
            if (d.temperature > max.temperature) {
                max = d;
            }
        });
        return [
            <span>{max.temperature.toFixed(2)} {String.fromCharCode("8451")}</span>,
            <label>максимальная температура</label>,
            <label>в комнате № {max.room}</label>
        ];
    }

    render() {
        const { data, isLoading, authenticationError } = this.state;
        if (isLoading) {
            return <div className="banner"><img src={require("../img/preloader.svg")} alt="загрузка"/></div>;
        }
        if (authenticationError) {
            return <div className="banner">Ошибка авторизации</div>;
        }
        return (
            <div className="overall-wrapper">
                <h3>Температура в здании</h3>
                <div className="overall">
                    <Link to={CONFIG.baseURL + "list?param=temperature&asc=true"}>
                        <div className="overall__min">
                            {this.renderMin(data)}
                        </div>
                    </Link>
                    <Link to={CONFIG.baseURL + "list?param=room&desc=true"}>
                        <div className="overall__average">
                            {this.renderAverage(data)} {String.fromCharCode("8451")}
                            <label>средняя температура</label>
                        </div>
                    </Link>
                    <Link to={CONFIG.baseURL + "list?param=temperature&desc=true"}>
                        <div className="overall__max">
                            {this.renderMax(data)}
                        </div> 
                    </Link>
                </div>
            </div>
        );
    }
}