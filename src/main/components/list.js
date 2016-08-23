import SystemStore from '../stores/systems-store';
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
        console.log(arguments);
        const correction = direction === "asc" ? 1 : -1;
        return data.sort((a, b) => {
            return correction * (a[param] > b[param] ? 1 : -1);
        });
    }

    render() {
        const { param, asc } = this.props.location.query;
        return (
            <div className="list">
                <Link to="/main/">Назад</Link>
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
                                        <th>{d.room}</th>
                                        <th>{d.temperature}</th>
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