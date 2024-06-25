document.addEventListener('DOMContentLoaded', function() {
    var immaginePrincipale = document.getElementById('Immagine_Centrata');
    var immagini = []; // Array per memorizzare le immagini caricate

    // Funzione per caricare il file JSON con solo URL delle immagini
    function caricaImmagini(callback) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', 'image.json', true); // Percorso del file JSON
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log("File JSON caricato correttamente");
                var data = JSON.parse(xhr.responseText);
                immagini = data.map(function(item) {
                    return item.URL;
                });
                callback();
            } else if (xhr.readyState == 4) {
                console.error("Errore nel caricamento del file JSON");
            }
        };
        xhr.send(null);
    }

    // Funzione per selezionare un'immagine casuale
    function selezionaImmagineCasuale() {
        var indiceCasuale = Math.floor(Math.random() * immagini.length);
        console.log("Immagine selezionata:", immagini[indiceCasuale]);
        return immagini[indiceCasuale]; // Restituisce l'URL dell'immagine
    }

    // Aggiunta dell'evento click all'immagine principale
    immaginePrincipale.addEventListener('click', function() {
        window.open("https://labs.onb.ac.at/en/datasets/akon/", "_blank");
    });

    caricaImmagini(function() {
        // Funzione per aggiornare l'immagine ogni 2 secondi
        setInterval(function() {
            var immagineCasuale = selezionaImmagineCasuale();
            immaginePrincipale.src = immagineCasuale;
        }, 2000); // 2000 millisecondi = 2 secondi

        function redirectToPostkartenPage() {
            window.location.href = "[8583_HYSTERISCHE_POSTKARTEN].html";
        }

        var backButton = document.querySelector('.back-button');
        backButton.addEventListener('click', redirectToPostkartenPage);
    });
});
