'use strict';

var main = (function(){

  // private variables
  var isFeatured = false,
      startDate;

  // private methods
  var handleNodelistItems = function( nodelist, fn ){
    var len = nodelist.length;
    for (var i=0; i<len; i++){
      fn( nodelist[i] );
    }
  }

  var addCountdownHandlers = function(){
    $(".limited").on("focus", handleFocus);
    function handleFocus(e){
      var max = parseInt( $(this).attr("maxlength") ),
          $counter = $(this).parent().find(".chars-remaining").eq(0);
      $(this).on("keyup", function(e){
        var remaining = max - $(this).val().length;
        $counter.html( remaining );
        if ( remaining < 10 ){
          $counter.addClass("warning");
        } else {
          $counter.removeClass("warning");
        }
      })
    }
  }

  var initDatePicker = function(){
    var $dp = $(".datepicker");
    var today = getTodaysDate();
    $dp.attr("placeholder", today);
    $dp.datepicker({
      dateFormat: 'M d, yy',
      minDate: new Date()
     } );

    $("#start-date").on("change", function(e){
      startDate = $(this).val();
      console.log(startDate);
    })
  }

  var initTimePicker = function(){
    $('.timepicker').timepicker({ 'scrollDefault': 'now' });
  }

  var initRecurrence = function(){

    $('#recurrenceTabs a').click(function (e) {
      e.preventDefault()
      $(this).tab('show')
    })

    $(".segmented-control").on("click", handleClick);

    function handleClick(e){
      // var $el = $(this).parent().prev(".input-wrapper");

      var id = e.target.getAttribute("id");
      if (id === null) return;
      switch ( id ){
        case "sc-1-1-1": // daily
          displayDaily();
          break;
        case "sc-1-1-2": // weekly
          displayWeekly();
          break;
        case "sc-1-1-3": // monthly
          displayMonthly();
          break;
        default:
          break;
      }
    }

    function disableDefaults( $el ){
      $el.addClass("disabled");
    }

    function enableDefaults( $el ){
      $el.removeClass("disabled");
      $("#repeat-daily").addClass("hidden");
    }

    function displayDaily(){
      startDate = $("#event-date").find(".start-date-input").val();
      var starttime = $("#event-date").find(".start-time-input").val();
      var endtime = $("#event-date").find(".end-time-input").val();

      $(".repeating-fields").addClass("hidden");

      $("#repeat-daily")
        .removeClass("hidden")
        .find(".start-date-input")
        .val( startDate )
        .end()
        .find(".start-time-input")
        .val( starttime)
        .end()
        .find(".end-time-input")
        .val( endtime );
    }

    function displayWeekly(){
      startDate = $("#event-date").find(".start-date-input").val();
      var starttime = $("#event-date").find(".start-time-input").val();
      var endtime = $("#event-date").find(".end-time-input").val();
      $(".repeating-fields").addClass("hidden");
      $("#repeat-weekly").removeClass("hidden");
    }

    function displayMonthly(){
      startDate = $("#event-date").find(".start-date-input").val();
      var starttime = $("#event-date").find(".start-time-input").val();
      var endtime = $("#event-date").find(".end-time-input").val();
      $(".repeating-fields").addClass("hidden");
      $("#repeat-monthly").removeClass("hidden");
    }
  }

  var getAddressFromData = function( target ){
    var attrs = target.attributes,
        len = attrs.length;

    var obj = {};

    for (var i=0; i<len; i++){
      var key = attrs[i].name.replace(/data-/, '');
      obj[key] = attrs[i].value ;
    }

    var html = obj['address'] !== undefined ? "<p class='address'>" + obj['address'] + "</p>": "";
    if ( obj['city'] !== undefined || obj['state'] !== undefined || obj['zipcode'] !== undefined) {
      html += "<p class='address'>";
      html += obj['city'] !== undefined ? obj['city'] + ", " : "";
      html += obj['state'] !== undefined ? obj['state'] + ", " : "";
      html += obj['zipcode'] !== undefined ? obj['zipcode'] : "";
      html += "</p>";
    }

    html += obj['phone'] !== undefined ? "<p class='address'>" + obj['phone'] + "</p>" : "";
    html += obj['email'] !== undefined ? "<p class='address'>" + obj['email'] + "</p>" : "";
    html += obj['website'] !== undefined ? "<p class='address'>" + obj['website'] + "</p>" : "";

    html += "<p><a href='#' class='edit-address'>Edit</a></p>";

    return { data: obj, html: html}
  }

  var renderFromDataAttrs = function( target ){
    if (target.tagName === "SPAN"){
      var target = target.parentNode;
    }
    var dataObj = getAddressFromData(target);
    var html = dataObj.html;
    var obj = dataObj.data;
    var $dest = $(target).parents(".select-from-list").next(".existing-contact");
    // write data to form
    console.log($dest);
    $dest
      .show()
      .find(".dynamic-html")
      .html("<div class='existing-venue'>"+html+"</div>");

    var address = obj['address'] + ", " + obj['city'] + ", " + obj['state'] + " " + obj['zipcode'];
    renderGoogleMap(address);

  }

  var selectFromDropdownListener = function(){
    var $list = $(".select-from-list");
    $list.find("input").eq(0).on("click", openList);

    $list.on("click", handleClick);

    function openList(e){
      e.preventDefault();
      var text, targ;
      if (e.target.tagName === "LI" || e.target.tagName === "SPAN"){
        text = e.currentTarget.querySelector(".selection");
        text.textContent = e.target.textContent;
        if (text.classList.contains("placeholder")) {
          text.classList.remove("placeholder");
        }
        renderFromDataAttrs( e.target );
      }

      $(e.currentTarget).find(".contacts-list").slideToggle();
    }

    function handleClick(e){
      openList(e);
      // subl$(e.currentTarget).find(".contacts-list").slideToggle();
    }
  }

  var createOrganizationListener = function(){
    $(".no-contact-button").on("click", handleClick);

    function handleClick(e){
      e.preventDefault();
      $(this).closest(".dropdown-wrapper").hide();
      var $parent = $(this).closest(".select-from-list");
      $parent.nextAll(".existing-contact")
        .eq(0)
        .slideUp( function(){
          $parent
            .nextAll(".new-contact-fields")
            .eq(0)
            .slideDown("fast", function(){
              $(this).find("input:first").focus();
            })

        })
    }

  }

  var addCancelListener = function(){
    $(".cancel-link").on("click", function(e){
      e.preventDefault();
      $(this).closest(".new-contact-fields").slideUp( function(){
        $(this).prevAll(".select-from-list").eq(0).find(".dropdown-wrapper").show();
      });
    })
  }

  var renderGoogleMap = function( address ){
    var mapCanvas = document.getElementById('map-canvas');
    var geocoder = new google.maps.Geocoder();

    function codeAddress() {

      var ltlng = [];

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          ltlng = results[0].geometry.location;
        } else {
          ltlng = {A: 44.5403, F: -78.5463};
        }
        createMap(ltlng);
      });
    }


    function createMap( ltlng ) {
      var mapOptions = {
        center: new google.maps.LatLng( ltlng.A, ltlng.F ),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      var map = new google.maps.Map(mapCanvas, mapOptions);
      var marker = new google.maps.Marker({
        map: map,
        position: ltlng
      });
    }
    codeAddress();
  }

  var updateFeaturedEventTitle = function(){
      var newTitle = $("#title").val();
      newTitle = newTitle !== "" ? newTitle : "New Event";

      $("#new-featured-event").html(newTitle);
    }

  var initFeatureToggle = function(){

    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();

    var $featured = $("#featured-event");
    $("#feature-toggle").on("change", function(e){
      if (!isFeatured){
        isFeatured = true;
        updateFeaturedEventTitle();
        updateStartEndDates();
        updateFeaturedEventDesc();
        $featured.slideDown();
      } else {
        isFeatured = false;
        $featured.slideUp();
      }
    })

    function updateFeaturedEventDesc(){
      var desc = document.getElementById("desc"),
          featuredDesc = document.getElementById("featured-desc");

      if ( desc.value.length ){
        featuredDesc.value = desc.value.substring(0,125) + "...";
      }
    }

    function updateStartEndDates(){
      $("#featured-start-date").val(getTodaysDate);
      $("#featured-end-date").val(startDate);
    }
  }

  var getTodaysDate = function(){
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var date = new Date();
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
  }

  var initTitleWatcher = function(){
    $("#title").on("change", function(e){
      if (isFeatured){
        updateFeaturedEventTitle();
      }
    });
  }

  var watchSortables = function(){
    $("#sortable").on("click", function(e){
      if ( $(e.target).hasClass("delete-button")){
        console.log($(e.target).parent());
        $(e.target).parent().remove();
      }
    })
  }

  var watchExpandables = function(){
    $(".expandable-button").on("click", function(e){
      $(this).next(".expandable-content").slideToggle();
    })
  }

  var initDuplicators = function(){
    $(".duplicator-group").on("click", function(e){
      if (e.target.classList.contains("duplicator")){
        e.preventDefault();
        duplicate(e);
      } else if (e.target.classList.contains("remover")){
        e.preventDefault();
        remove(e);
      }
    });


    function duplicate(e){
      var $this = $( e.target ),
          $parent = $this.parent(),
          $duplicables = $parent.find(".duplicable"),
          len = $duplicables.length,
          $dupeThisOne = $duplicables.eq(len-1);

      $duplicables.find(".remover").show();
      $dupeThisOne.clone().insertBefore($this);

      // if (len === 2){
      //   $this.hide();
      // }

    }

    function remove(e){
      $(e.target).parent().remove();
      var groups = $(e.currentTarget).parent().find(".duplicable");
      if (groups.length === 1){
        groups.parent().find(".remover").hide();
      }
    }
  }

  var init = function(){
    renderCountdownText();
    addCountdownHandlers();
    selectFromDropdownListener();
    createOrganizationListener();
    initRecurrence();
    initDatePicker();
    initTimePicker();
    initDuplicators();
    initFeatureToggle();
    initTitleWatcher();
    watchSortables();
    addCancelListener();
    watchExpandables();
  }

  var renderCountdownText = function(){
    var elems = document.getElementsByClassName("countdown");
    handleNodelistItems( elems, getMax);
    function getMax( elem ){
      var max = elem.parentNode.getElementsByClassName("limited")[0].getAttribute("maxlength");
      elem.parentNode.getElementsByClassName("chars-remaining")[0].textContent = max;
    }

  }

  // module
  return {
    init: init,
  };


})();

$("document").ready(function(){
  main.init();
});


var noselect = false;
var novenue = document.getElementById("no-venue");