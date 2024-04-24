document.addEventListener('DOMContentLoaded', function() {
    var immaginePrincipale = document.getElementById('Immagine_Centrata');
    var immagineSottostante = document.getElementById('Immagine_Sottostante');

    immaginePrincipale.addEventListener('mouseover', function() {
        immaginePrincipale.src = immagineSottostante.src;
    });

    immaginePrincipale.addEventListener('mouseout', function() {
        immaginePrincipale.src = 'immagini/wp5404034-59414419.png'; // Aggiunta dell'estensione .png
    });

    function redirectToPostkartenPage() {
        window.location.href = "[8583_HYSTERISCHE_POSTKARTEN].html";
    }

    var backButton = document.querySelector('.back-button');
    backButton.addEventListener('click', redirectToPostkartenPage);
});
