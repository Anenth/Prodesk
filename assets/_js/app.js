/* global firebase, $*/

import './page';
import loadcss from 'loadcss';


function lazyLoadCss() {
    const cssFiles = [
        '/assets/css/main.css',
        'https://fonts.googleapis.com/css?family=Montserrat:400,700|Open+Sans:300,400,700',
        'https://cdnjs.cloudflare.com/ajax/libs/Swiper/3.4.2/css/swiper.min.css'
    ]
    loadcss(cssFiles);
}


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

function submitButton(is_loading) {
    $('button[type=submit]')
    .prop('disabled', is_loading)
    .toggleClass('btn-loading', is_loading);
}

function writeUserData(data, key) {
    submitButton(true);
    var config = {
        apiKey: "AIzaSyAUB0d_CiOAspF1kuaajU8OhfM2DYqo3HQ",
        authDomain: "healthydesk-75f21.firebaseapp.com",
        databaseURL: "https://healthydesk-75f21.firebaseio.com",
        projectId: "healthydesk-75f21",
        storageBucket: "healthydesk-75f21.appspot.com",
        messagingSenderId: "770488580054"
    };
    firebase.initializeApp(config);

    firebase.database().ref(key+'/')
    .push(data)
    .then(function() {
        submitButton(false);
        $('form')[0].reset();
        $('.js-success').slideDown();
        $('.js-form-content').slideUp();
    }).catch(function() {
        submitButton(false);
        $('.js-error').slideDown();
    });
}

// function handleFormSubmission() {
//     $('.js-place-order').on('submit', function(e) {
//         e.preventDefault();
//         $('.js-success, .js-error').slideUp();
//         var $form = $(e.currentTarget);
//         var name = $form.find('[name=name]').val();
//         var phone = $form.find('[name=phone]').val();
//         var email = $form.find('[name=email]').val();
//         var message = $form.find('[name=message]').val();
//         var no_units = $form.find('[name=no_units]') && $form.find('[name=no_units]').val();
       
//         writeUserData({name: name, email: email, phone: phone, no_units: no_units, message: message});
//     });
// }

function handleFormShowInterest() {
    $('.js-interest-order').on('submit', function(e) {
        e.preventDefault();
        $('.js-success, .js-error').slideUp();
        var $form = $(e.currentTarget);
        var email = $form.find('[name=email]').val();
       
        writeUserData({email: email}, 'show_interest');
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
    lazyLoadCss();
    // handleFormSubmission();
    handleFormShowInterest();
    initImageSlider();
}

(function(){
    init();
})();