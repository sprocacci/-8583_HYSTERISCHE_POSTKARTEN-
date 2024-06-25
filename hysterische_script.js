$(document).ready(function() {
    // Funzione per impostare i testi predefiniti nei contenitori di informazioni
    function setDefaultInfoTexts() {
        $('#filename-container').text('NOME');
        $('#latitude-container').text('LATITUDINE');
        $('#longitude-container').text('LONGITUDINE');
        $('#date-container').text('DATA');
        $('#city-container').text('CITTÀ');
        $('#building-container').text('STRUTTURA');
    }

    // Imposta i testi predefiniti all'avvio della pagina
    setDefaultInfoTexts();

    // Variabili globali
    var images; // Array contenente i dati delle immagini
    var savedImageData; // Dati dell'immagine salvati per il ridimensionamento del canvas
    var imageArray = []; // Array delle immagini caricato sul canvas
    var loadingImages = false; // Flag per indicare se le immagini stanno caricando
    var currentXHR = null; // Oggetto XHR corrente
    var currentImageName = ''; // Nome dell'immagine corrente
    var canvasOffset; // Offset del canvas
    var canvasLeft; // Posizione sinistra del canvas
    var canvasTop; // Posizione superiore del canvas
    var canvasScaleFactor; // Fattore di scala del canvas
    var segmentWidth; // Larghezza del segmento del canvas
    var segmentHeight; // Altezza del segmento del canvas
    var imageModalOpen = false; // Flag per tracciare lo stato della finestra modale dell'immagine

    // Funzione per cancellare completamente il canvas e tutte le immagini
    function clearCanvasAndImages() {
        var canvas = document.getElementById("main-canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Cancella il canvas
        imageArray = []; // Resetta l'array delle immagini
    }

    // Funzione per cancellare le immagini esistenti e interrompere eventuali caricamenti in corso
    function clearCanvas() {
        var canvas = document.getElementById("main-canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Cancella il canvas
        clearLoadingImages(); // Chiama la funzione per cancellare le immagini in caricamento
        // Annulla la richiesta XHR pendente se presente
        if (currentXHR) {
            currentXHR.abort();
            currentXHR = null;
        }
    }

    // Funzione per cancellare le immagini in caricamento
    function clearLoadingImages() {
        // Interrompi direttamente il caricamento delle immagini
        for (var i = 0; i < imageArray.length; i++) {
            if (imageArray[i].image.complete) continue; // Se l'immagine è già caricata, passa alla successiva
            imageArray[i].image.onload = null; // Rimuovi l'evento onload per evitare il caricamento dell'immagine
        }
        imageArray = []; // Resetta l'array delle immagini
        loadingImages = false; // Imposta il flag loadingImages a false
    }

    // Caricamento dei dati delle immagini dal file JSON
    $.getJSON('image.json', function(data) {
        images = data; // Assegna i dati delle immagini alla variabile images

        // Funzione per ridimensionare il canvas
        function resizeCanvas(event) {
            if (event && event.type === 'resize') {
                // Ridimensiona il canvas in base alla dimensione del suo contenitore
                var canvas = document.getElementById("main-canvas");
                //saveCanvas(); // Salva i dati del canvas prima del ridimensionamento
                canvas.width = canvas.parentNode.clientWidth;
                canvas.height = canvas.parentNode.clientHeight;
                if (savedImageData) {
                    canvas.putImageData(savedImageData, 0, 0);
                }
                // Mantieni visibile il testo "FILENAME" durante il ridimensionamento della finestra
                $('#filename-container').text('FILENAME');
                console.log("1");
            } else {
                // Ridimensiona il canvas alla larghezza della finestra
                var canvas = document.getElementById("main-canvas");
                var aspectRatio = 1654 / 1076; // Rapporto d'aspetto originale
                var newWidth = window.innerWidth; // Nuova larghezza del canvas
                var newHeight = newWidth / aspectRatio; // Nuova altezza del canvas
                canvas.width = newWidth; // Imposta la nuova larghezza del canvas
                canvas.height = newHeight; // Imposta la nuova altezza del canvas
                segmentWidth = canvas.width; // Aggiorna la larghezza del segmento
                segmentHeight = canvas.height / $('#split').val(); // Aggiorna l'altezza del segmento
                mixImages(); // Mescola le immagini
                console.log("2");
            }
        }

        // Funzione per annullare la richiesta XHR corrente, se presente
        function cancelCurrentXHR() {
            if (currentXHR) {
                currentXHR.abort();
                currentXHR = null;
            }
        }

        // Funzione per mescolare le immagini sul canvas
function mixImages() {
    cancelCurrentXHR(); // Annulla la richiesta XHR pendente

    if (loadingImages) {
        clearCanvas(); // Cancella il canvas se le immagini stanno ancora caricando
    }

    loadingImages = true; // Imposta il flag loadingImages a true

    var splitVal = $('#split').val(); // Numero di divisioni specificato dall'utente
    if (splitVal === '') {
        splitVal = 1; // Imposta un valore predefinito di 1 se il campo è vuoto
    }
    splitVal = parseInt(splitVal); // Converti il valore in un numero intero

    var canvas = document.getElementById("main-canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Cancella il canvas
    segmentHeight = canvas.height / splitVal; // Calcola l'altezza del segmento
    segmentWidth = canvas.width; // Imposta la larghezza del segmento uguale alla larghezza del canvas

    imageArray = []; // Resetta l'array delle immagini

    // Funzione per caricare un'immagine
    function loadImage(index) {
        var image = new Image(); // Crea un nuovo elemento immagine
        image.onload = function() {
            var y = index * segmentHeight; // Calcola la posizione verticale dell'immagine sul canvas
            ctx.save(); // Salva il contesto di disegno
            ctx.beginPath();
            ctx.rect(0, y, segmentWidth, segmentHeight); // Crea un rettangolo per il clipping
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // Disegna l'immagine sul canvas
            ctx.restore(); // Ripristina il contesto di disegno

            // Controlla se tutte le immagini sono state caricate
            var allImagesLoaded = imageArray.every(function(imgObj) {
                return imgObj.image.complete;
            });

            if (allImagesLoaded) {
                loadingImages = false; // Imposta il flag loadingImages a false quando tutte le immagini sono caricate
            }
        };
        var randomIndex = Math.floor(Math.random() * images.length); // Genera un indice casuale
        // Aggiunge l'immagine all'array delle immagini caricando i dati dall'array images
        imageArray.push({ 
            image: image, 
            filename: images[randomIndex].filename, 
            latitude: images[randomIndex].latitude, 
            longitude: images[randomIndex].longitude,
            date: images[randomIndex].date, 
            city: images[randomIndex].city,
            building: images[randomIndex].building
        });
        image.src = images[randomIndex].URL; // Imposta l'URL dell'immagine
        images.splice(randomIndex, 1); // Rimuove l'immagine dall'array images per evitare duplicati
    }

    // Carica almeno un'immagine se splitVal è 0 o NaN
    if (splitVal <= 0 || isNaN(splitVal)) {
        splitVal = 1;
    }

    // Carica le immagini e mescolale sul canvas
    for (var i = 0; i < splitVal; i++) {
        loadImage(i);
    }

    $(imageArray[imageArray.length - 1].image).on('load', function() {
        loadingImages = false; // Imposta il flag loadingImages a false quando tutte le immagini sono caricate
    });


}

        // Funzione per cambiare il colore del pulsante "GENERA" dopo il click
        function toggleButtonColors() {
            $('#mixButton').toggleClass('button-clicked');
        }

        // Gestisce l'evento mouseover sul canvas
        $('#main-canvas').on('mouseover', function() {
            // Cancella il contenuto dei contenitori di informazioni
            $('#filename-container').empty();
            $('#latitude-container').empty();
            $('#longitude-container').empty();
            $('#date-container').empty();
            $('#city-container').empty();
            $('#building-container').empty();
        });

        // Gestisce l'evento mouseout sul canvas
        $('#main-canvas').on('mouseout', function() {
            // Ripristina il testo nei contenitori di informazioni
            setDefaultInfoTexts();
        });

        // Gestisce l'evento mousemove sul canvas
        $('#main-canvas').on('mousemove', function(event) {
            // Ottiene le coordinate del mouse rispetto al canvas
            var canvas = document.getElementById("main-canvas");
            canvasOffset = $(canvas).offset();
            canvasLeft = canvasOffset.left;
            canvasTop = canvasOffset.top;
            canvasScaleFactor = canvas.width / $(canvas).width();
            var mouseX = parseInt((event.pageX - canvasLeft) * canvasScaleFactor);
            var mouseY = parseInt((event.pageY - canvasTop) * canvasScaleFactor);
            // Calcola l'indice dell'immagine corrispondente alla posizione del mouse
            var segmentX = Math.floor(mouseX / segmentWidth);
            var segmentY = Math.floor(mouseY / segmentHeight);
            var index = segmentY * Math.ceil(canvas.width / segmentWidth) + segmentX;
            if (imageArray[index]) {
                // Mostra le informazioni dell'immagine corrispondente
                var filename = imageArray[index].filename;
                var latitude = imageArray[index].latitude;
                var longitude = imageArray[index].longitude;
                var date = imageArray[index].date;
                var city = imageArray[index].city;
                var building = imageArray[index].building;
                // Visualizza le informazioni nei rispettivi contenitori
                $('#filename-container').text(`${filename}`);
                $('#latitude-container').text(`${latitude}`);
                $('#longitude-container').text(`${longitude}`);
                $('#date-container').text(`${date}`);
                $('#city-container').text(`${city}`);
                $('#building-container').text(`${building}`);
            } else {
                // Cancella il contenuto dei contenitori di informazioni
                setDefaultInfoTexts();
            }
        });

        // Funzione per gestire il click sul pulsante "Genera"
        $('#mixButton').click(function() {
            var splitVal = $('#split').val(); // Numero di divisioni specificato dall'utente
            if (splitVal < 1 || splitVal > 100 || isNaN(splitVal)) {
                $('#split').val(''); // Pulisci l'input
                $('#split').attr('placeholder', 'INSERIRE UN VALORE 1 A 100'); // Mostra il messaggio di avviso
            } else {
                $('#split').attr('placeholder', 'NUMERO DI PORZIONI'); // Ripristina il messaggio predefinito
                clearCanvasAndImages(); // Cancella completamente il canvas e le immagini attualmente caricate
                mixImages(); // Avvia il mix and match dopo che il canvas è stato cancellato
                toggleButtonColors(); // Cambia il colore del pulsante "GENERA"
            }
        });

        // Ridimensiona il canvas quando viene ridimensionata la finestra del browser
        //$(window).resize(resizeCanvas);
        resizeCanvas(); // Esegue il ridimensionamento del canvas all'avvio

        // Aggiunge un event listener per l'evento keydown sull'intero documento per avviare il mix and match premendo il tasto Invio
$(document).on('keydown', function(event) {
    // Controlla se la finestra modale dell'immagine è aperta
    if (event.key === "Enter" && imageModalOpen) {
        // Chiudi la finestra modale quando viene premuto Invio
        var modal = document.getElementById("imageModal");
        modal.style.display = "none"; // Nasconde il popup
        imageModalOpen = false; // Imposta il flag a false
    } else if (event.key === "Enter") {
        // Altrimenti, se la finestra modale non è aperta, verifica il valore inserito e avvia il mix and match
        var splitVal = $('#split').val(); // Numero di divisioni specificato dall'utente
        if (splitVal < 1 || splitVal > 100 || isNaN(splitVal)) {
            $('#split').val(''); // Pulisci l'input
            $('#split').attr('placeholder', 'INSERIRE UN VALORE 1 A 100'); // Mostra il messaggio di avviso
        } else {
            mixImages(); // Avvia il mix and match
        }
        $('#split').blur(); // Togli il focus dall'input #split
    } else if (event.key === "Escape" && imageModalOpen) {
        // Chiudi la finestra modale quando viene premuto Esc
        var modal = document.getElementById("imageModal");
        modal.style.display = "none"; // Nasconde il popup
        imageModalOpen = false; // Imposta il flag a false
    }
});

        var normalDiv = document.getElementById('image-container');
        var fixedElement = document.getElementsByClassName('container-bottom');
        var titleElement = document.getElementsByClassName('title-h1');

        var fixedElementHeight = fixedElement[0].clientHeight;
        var titleElementHeight = titleElement[0].clientHeight;

        normalDiv.style.height = (window.innerHeight - fixedElementHeight - titleElementHeight) + 'px';
    })
    
    .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.error("Request Failed: " + err);
    });

    // Gestisce il click sul canvas
    $('#main-canvas').on('click', function(event) {
        // Ottiene le coordinate del mouse rispetto al canvas
        var canvas = document.getElementById("main-canvas");
        canvasOffset = $(canvas).offset();
        canvasLeft = canvasOffset.left;
        canvasTop = canvasOffset.top;
        canvasScaleFactor = canvas.width / $(canvas).width();
        var mouseX = parseInt((event.pageX - canvasLeft) * canvasScaleFactor);
        var mouseY = parseInt((event.pageY - canvasTop) * canvasScaleFactor);
        // Calcola l'indice dell'immagine corrispondente alla posizione del mouse
        var segmentX = Math.floor(mouseX / segmentWidth);
        var segmentY = Math.floor(mouseY / segmentHeight);
        var index = segmentY * Math.ceil(canvas.width / segmentWidth) + segmentX;
        if (imageArray[index]) {
            var imageURL = imageArray[index].image.src;
            openImagePopup(imageURL); // Apre il popup dell'immagine corrispondente
        }
    });

    // Funzione per aprire il popup dell'immagine
    function openImagePopup(imageURL) {
        var modal = document.getElementById("imageModal");
        var modalImg = document.getElementById("selectedImage");
        modal.style.display = "block"; // Mostra il popup
        modalImg.src = imageURL; // Imposta l'URL dell'immagine nel popup
        imageModalOpen = true; // Imposta il flag a true
    }

    // Funzione per chiudere il popup dell'immagine
    $('#closeImage').click(function() {
        var modal = document.getElementById("imageModal");
        modal.style.display = "none"; // Nasconde il popup
        imageModalOpen = false; // Imposta il flag a false
    });

    // Aggiunge un event listener per l'evento keydown sulla finestra per chiudere la finestra modale dell'immagine premendo Esc
    window.addEventListener('keydown', function(event) {
        var modal = document.getElementById("imageModal");
        if (event.key === "Escape" && imageModalOpen) {
            modal.style.display = "none"; // Nasconde il popup
            imageModalOpen = false; // Imposta il flag a false
        }
    });

    $('#split').val(''); // Imposta il valore vuoto
    $('#split').focus(); // Imposta il focus sull'input

    });