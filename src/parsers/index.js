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
        return s['hydra:member'].map((s, index) => {
            const id = getIdFromURI(s['@id']);
            return extractSystemFromAPIMessage(s, index);
        });
    },
    parseObservations(obs) {
        return obs;
    },
    parseObservationFromWamp(obs) {
        return obs;
    }
}