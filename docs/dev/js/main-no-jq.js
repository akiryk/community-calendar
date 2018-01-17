'use strict';

var utils = {
  handleNodelistItems: function( nodelist, fn ){
    var len = nodelist.length;
    for (var i=0; i<len; i++){
      fn( nodelist[i] );
    }
  }
}

var main = (function(){

  var init = function(){
    handleInputDropdowns();
    document.addEventListener("click", closeOpenWidgets);
  }

  var closeOpenWidgets = function(e){
    var els = document.querySelectorAll(".open")
    utils.handleNodelistItems(els, function( el ){
      el.classList.remove("open");
    });
  }

  var onClickHandler = function (e){
    if (e.target.tagName === "INPUT"){
      e.stopPropagation();
      var dropdown = e.currentTarget.querySelector(".dropdown");
      dropdown.classList.add("open");
      dropdown.addEventListener("click", listHandler);
    }
  }

  var listHandler = function (e){
    console.log(e.currentTarget.classList);
    e.currentTarget.removeEventListener("click", listHandler);
    e.currentTarget.classList.remove("open");
    console.log(e.currentTarget.classList);
    e.currentTarget.previousElementSibling.value =  e.target.textContent;
  }

  var handleInputDropdowns = function(){
    var dropdowns = document.querySelectorAll(".input-dropdown-wrapper");

    utils.handleNodelistItems( dropdowns, function( el ){
      el.addEventListener("click", onClickHandler);
    });
  }


  
  init();

})();

(function(){

  var _ = function(options){
    this.name = options.name;
    this.age = options.age;
    this.update();
  }

  _.prototype = {

    older: function(){
      this.age++;
      this.update();
    },

    update: function(){
      console.log("hello, I'm " + this.name + " and I'm " + this.age + "  years old");
    },

    changeName: function(newname){
      this.name = newname;
      this.update();
    }

  }

  function $(expr){
    return document.querySelector(expr);
  }

  $.bind = function( el ){
    el.addEventListener("click", function(e){
      console.log("clicked!");
      console.log(e);
    })
  }

  var x = $(".main-heading");
  $.bind( x );

})();

$(".awesomplete").on("awesomplete-open", function(e){
  $(this)
    .next("ul")
    .append("<li id='no-venue' class='list-link'>Can\'t find your venue?</li>");

  $("#no-venue").on("click", function(e){
    var input = $(this).parent().prev().;
    console.log(input.val());

  })
});

$(".awesomplete").on("awesomplete-select", function(e){
  // console.log($(this));
  // console.log($(this).val());
  e.preventDefault();
});

$(".awesomplete").on("awesomplete-selectcomplete", function(e){
  // console.log($(this).val());
  // console.log(e.currentTarget.value);
});



