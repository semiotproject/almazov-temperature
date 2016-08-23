import SystemStore from '../stores/systems-store';
const { Link } = ReactRouter;

require('../css/main.less');

export default class Main extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoading: true,
            data: []
        };

        this.handleUpdate = () => {
            this.setState({
                data: SystemStore.getData()
            });
        };
    }

    componentDidMount() {
        SystemStore.load().then((res) => {
            this.setState({
                isLoading: false,
                data: res
            });
        });
        SystemStore.on('update', this.handleUpdate);
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
        const { data, isLoading } = this.state;
        console.log(data);
        return !isLoading && (
            <div className="overall-wrapper">
                <h3>Температура в здании</h3>
                <div className="overall">
                    <Link to="/main/list?param=temperature&asc=true">
                        <div className="overall__min">
                            {this.renderMin(data)}
                        </div>
                    </Link>
                    <Link to="/main/list?param=room&desc=true">
                        <div className="overall__average">
                            {this.renderAverage(data)} {String.fromCharCode("8451")}
                            <label>средняя температура</label>
                        </div>
                    </Link>
                    <Link to="/main/list?param=temperature&desc=true">
                        <div className="overall__max">
                            {this.renderMax(data)}
                        </div> 
                    </Link>
                </div>
            </div>
        );
    }
}