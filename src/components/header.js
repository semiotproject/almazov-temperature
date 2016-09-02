import React from 'react';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="header-wrapper">
                <h2>
                    <img src={require("../img/logo.jpg")} alt="" width="50px" height="50px"/>
                    <span>ФГБУ «СЗФМИЦ им. В. А. Алмазова» Минздрава России</span>
                </h2>
                <h3>Температура в здании</h3>
            </div>
        );
    }
}