import SystemStore from '../stores/systems-store';
import CONFIG from '../config';

const { Link } = ReactRouter;

export default class List extends React.Component {
    constructor() {
        super();
        this.state = {
            
        };

        this.handleUpdate = () => {
            this.forceUpdate();
        }
    }

    componentDidMount() {
        SystemStore.on("update", this.handleUpdate);
    }
    componentWillUnmount() {
        SystemStore.removeListener('update', this.handleUpdate);
    }

    sortBy(data, param, direction) {
        const correction = direction === "asc" ? 1 : -1;
        return data.sort((a, b) => {
            return correction * (a[param] > b[param] ? 1 : -1);
        });
    }
    renderDynamic(d) {
        if (d.prevTemperature) {
            return d.temperature - d.prevTemperature > 0 ? String.fromCharCode("8593") : String.fromCharCode("8595");
        }
    }

    render() {
        const { param, asc } = this.props.location.query;
        return (
            <div className="list">
                <Link to={CONFIG.baseURL}>Назад</Link>
                <table>
                    <thead>
                        <tr>
                            <th>Комната</th>
                            <th>Температура, C</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.sortBy(
                                SystemStore.getData(),
                                param,
                                asc ? "asc" : "desc"
                            ).map((d) => {
                                return (
                                    <tr>
                                        <td>{d.room}</td>
                                        <td>{d.temperature} {this.renderDynamic(d)}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}