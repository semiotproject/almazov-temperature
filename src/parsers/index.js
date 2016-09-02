function extractSystemNameFromAPIMessage(msg) {
    return msg['rdfs:label'] ? msg['rdfs:label']['@value'] : msg['@id'];
}

function getIdFromURI(uri) {
    return uri.substring(uri.lastIndexOf('/') + 1);
}

function extractSystemFromAPIMessage(msg, index = -1) {
    return {
        index: index + 1,
        uri: msg['@id'],
        id: msg['dcterms:identifier'],
        name: extractSystemNameFromAPIMessage(msg)
    };
}

export default {
    parseSystems(s) {
        return s['hydra:member'].filter((s) => {
            return s["@type"] === "apidoc:DHT22Device";
        }).map((s, index) => {
            return {
                uri: s['@id']
            }
        });
    },
    parseSystem(s) {
        let temperatureSensor = _.find(s["ssn:hasSubSystem"], (ss) => {
            return ss["proto:hasPrototype"] === "https://raw.githubusercontent.com/semiotproject/semiot-drivers/master/dht22/src/main/resources/ru/semiot/platform/drivers/dht22/prototype.ttl#DHT22Device-TemperatureSensor"
        });
        return {
            room: s["geo:location"]["http://schema.org/branchCode"],
            temperatureSensorUri: temperatureSensor && temperatureSensor["@id"]
        };
    },
    parseSensor(s) {
        return s;
    },
    parseObservation(obs) {
        const parsedObs = {};
        const hydraOperationRoot = obs["hydra-filter:viewOf"] ? obs["hydra-filter:viewOf"] : obs;
        const subscriptionOperation = hydraOperationRoot['hydra:operation'];
        parsedObs.topic = subscriptionOperation['hydra-pubsub:topic'];
        try {
            parsedObs.temperature = obs["hydra:member"][0]["ssn:observationResult"]["ssn:hasValue"]["qudt:quantityValue"];
        } catch (e) {
            console.error(e);
        }
        return parsedObs;
    },
    parseObservationFromWamp(obs) {
        return obs;
    }
}