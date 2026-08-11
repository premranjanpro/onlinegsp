$(document).ready(function() {
	"use strict";

    //MEGA MENU	
    $(".about-menu").hover(function() {
        $(".about-mm").stop().fadeIn();
    });
    $(".about-menu").mouseleave(function() {
        $(".about-mm").stop().fadeOut();
    });
    //MEGA MENU	
    $(".admi-menu").hover(function() {
        $(".admi-mm").stop().fadeIn();
    });
    $(".admi-menu").mouseleave(function() {
        $(".admi-mm").stop().fadeOut();
    });
    //MEGA MENU	
    $(".cour-menu").hover(function() {
        $(".cour-mm").stop().fadeIn();
    });
    $(".cour-menu").mouseleave(function() {
        $(".cour-mm").stop().fadeOut();
    });
    //SINGLE DROPDOWN MENU
    $(".top-drop-menu").on('click', function() {
        $(".man-drop").stop().fadeIn();
    });
    $(".man-drop").mouseleave(function() {
        $(".man-drop").stop().fadeOut();
    });
    $(".wed-top").mouseleave(function() {
        $(".man-drop").stop().fadeOut();
    });

    //SEARCH BOX
    $("#sf-box").on('click', function() {
        $(".sf-list").fadeIn();
    });
    $(".sf-list").mouseleave(function() {
        $(".sf-list").fadeOut();
    });
    $(".search-top").mouseleave(function() {
        $(".sf-list").fadeOut();
    });

    //AWARDS
    $(".s17-eve-time-msg").on('click', function() {
        $('.time-hide').slideUp();
        $(this).children('.time-hide').stop().slideToggle();
    });
   

    //MOBILE MENU OPEN
    $(".ed-micon").on('click', function() {
        $(".ed-mm-inn").addClass("ed-mm-act");
    });
    //MOBILE MENU CLOSE
    $(".ed-mi-close").on('click', function() {
        $(".ed-mm-inn").removeClass("ed-mm-act");
    });
	
	
    //GOOGLE MAP - SCROLL REMOVE
    $('.contact-map')
        .on('click', function() {
            $(this).find('iframe').addClass('clicked')
        })
        .on('mouseleave', function() {
            $(this).find('iframe').removeClass('clicked')
        });

});