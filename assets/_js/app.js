import './page'

function lazyLoadImages() {
    var imgElement = document.querySelectorAll('.lazy');
    for (var i = 0; i < imgElement.length; ++i) {
        imgElement[i].onload = function () {
            this.className += " loaded";
        }
        if (imgElement[i].complete) {
            imgElement[i].className += " loaded";
        }
    }
}

function writeUserData(data) {
    var config = {
        apiKey: "AIzaSyAUB0d_CiOAspF1kuaajU8OhfM2DYqo3HQ",
        authDomain: "healthydesk-75f21.firebaseapp.com",
        databaseURL: "https://healthydesk-75f21.firebaseio.com",
        projectId: "healthydesk-75f21",
        storageBucket: "healthydesk-75f21.appspot.com",
        messagingSenderId: "770488580054"
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    
    firebase.database().ref('request/').push({
        name: data.name,
        email: data.email,
        phone: data.phone,
        no_units: data.no_units || 0,
        message: data.message
    }).then(function() {
        $('.js-place-order')[0].reset();
        $('.js-success').slideDown();
    }).catch(function() {
        $('.js-error').slideDown();
    });
}

function handleFormSubmission() {
    $('.js-place-order').on('submit', function(e) {
        e.preventDefault();
        $('.js-success, .js-error').slideUp();
        var $form = $(e.currentTarget);
        var name = $form.find('[name=name]').val();
        var phone = $form.find('[name=phone]').val();
        var email = $form.find('[name=email]').val();
        var message = $form.find('[name=message]').val();
        var no_units = $form.find('[name=no_units]') && $form.find('[name=no_units]').val();
       
        writeUserData({name: name, email: email, phone: phone, no_units: no_units, message: message});
    });
}

function initImageSlider() {
     var swiper = new Swiper('.js-swiper-container', {
        nextButton: '.js-swiper-button-next',
        prevButton: '.js-swiper-button-prev',
        slidesPerView: 3,
        spaceBetween: 30,
        zoom: true,
        freeMode: true,
        preloadImages: false,
        lazyLoading: true,
        breakpoints: {
            640: {
                slidesPerView: 1
            }
        }
    });
}
 
function init() {
    lazyLoadImages();
    handleFormSubmission();
    initImageSlider();
}

(function(){
    init();
})();