/*! 
 * ZP Form Validation
 * $Id: zp-validate-form.js 2022-07-14 11:37:36 +0200 Stefan S  2723036f4925e3023359046b77436c78392721fa $
 * Copyright Zeta Software GmbH
 */

// define zp Namespace for later use in individual widgets if not only defined
if ( typeof(zp)==="undefined" ){
	var zp = {};
}

$z(document).ready(function () {
	// replace macros inseretd in Forms with query string parameters
	zp.Templating = function (){
		var templating = this;
		var urlParams;
		this.init = function (){
			// parse the query string and store all name/value pairs in an associative array (object)
			var match,
				pl     = /\+/g,  // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
				query  = window.location.search.substring(1);
			urlParams = {};
			while (match = search.exec(query)){
			   // for safety reasons, encode html in the query string using jquery (http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery) - seems not needed in this context
			   // var encodedString = $z("<div/>").text(decode(match[2])).html();
			   // urlParams[decode(match[1])] = encodedString;
			   urlParams[decode(match[1])] = decode(match[2]);
			}
			/*
			for(var index in urlParams) {
				console.log( index + " : " + urlParams[index]);
			}
			*/
		
			// run the actual template-string to query string-value replacements
			templating.doTemplate();
		};
	
		this.doTemplate = function(){
			$z("form textarea:contains('{@'), form input[value*='{@']").each(function(){
				// iterate trough each placeholder pattern (search)
				var search = /({\@([^}]+)})/g;
				// we can't use jquery val() below, since the value could be invalid according to the HTML5-Fieldtype and the browser would thus return null therefore, use .prop("defaultValue")
				while ( match = search.exec($z(this).prop("defaultValue")) ){
					var re = new RegExp(match[1], "gi"); //sets a new pattern (i.e.: /{@name}/gi ) based on the found teplate string
				
					if ( urlParams[match[2]] ){ 
						// if the query string contains a value for the currently matched template, replace template with value
						$z(this).val( $z(this).prop("defaultValue").replace(re, urlParams[match[2]]) );
					}
					else{
						// else, remove template (incl. trailing whitespace) string
						re = new RegExp(match[1] + "\\s*", "gi");
						$z(this).val( $z(this).prop("defaultValue").replace(re, "") );
					}
				}
			});
		
			$z("form select[data-default*='{@']").each(function(){
				// iterate trough each placeholder pattern (search)
				var search = /({\@([^}]+)})/g;
				while ( match = search.exec($z(this).attr("data-default")) ){
					if ( urlParams[match[2]] ){ 
						// if the query string contains a value for the currently matched optoion, make it selected
						$z(this).find("option").each(function(){
							if ( $z(this).text().trim() == urlParams[match[2]] ){
								$z(this).attr("selected", true);
							}
						});
					}
				}
			});
		};
	};
	
	// initialize Templating - simple Templating (replace template-string with URL parameter)
	// The template-string {@name} will be replaced with the value of the URLs Query-String named "name" or else be removed - templating is enabled for: input and textarea
	new zp.Templating().init();
	
	// helper function to figure out when to hide labels and siaplay them as placeholder instead
	function hideLabel(theField){
		// Check for HTML5-Fieldtypes which fill the field with widgets, so the placeholder text isn't visible
		var fieldsWithoutPlaceholder = ["date","time","color"];
		var fieldType = $z(theField).attr("type");
		if ( fieldsWithoutPlaceholder.indexOf(fieldType) !== -1 ){  
			// current field type was found in array of field types we want to ignore
			// check if the browser supports the current field type and if so, return false so we don't hide the label
			var i = document.createElement("input");
			i.setAttribute("type", fieldType);
			if (i.type !== "text"){
				return false;
			}	
		}
		
		if ( $z(theField).attr("placeholder") !== "" && $z(theField).attr("placeholder") !== undefined ){
			// placeholder attribute is set, so we hide the label
			return true;
		}
		return false;
	}
	$z(".zp-form.zp14.autohidelabels").each(function(){
		var theForm = $z(this);
		// show placeholders if JS is on (we had hidden them in CSS to not show both, labels and placeholders
		theForm.addClass("placeholder");
		// hide labels of empty fields (except date and time fields)
		theForm.find('input.typetext:not([type="date"]):not([type="time"]), textarea').filter(function() { return $z(this).val() == ""; }).each(function(){
			if ( $z.support.placeholder && hideLabel($z(this)) ){
				$z(this).parent().addClass("nolabel");
			}
		});
		// when something is typed into an input text field or when it is being emtied, show the label again
		//  (except date and time fields)
		theForm.find('input.typetext, textarea').off("keyup");
		theForm.find('input.typetext:not([type="date"]):not([type="time"]), textarea').on("keyup", function(){
			if( $z(this).val() !== "" ){
				$z(this).parent().removeClass("nolabel");
			}
			else{
				$z(this).parent().addClass("nolabel");
			}
		});
		theForm.find('input.typetext, textarea').off("blur");
		theForm.find('input.typetext:not([type="date"]):not([type="time"]), textarea').on("blur", function(){
			if( $z(this).val() !== "" ){
				$z(this).parent().removeClass("nolabel");
			}
			else{
				$z(this).parent().addClass("nolabel");
			}
		});
	});
		
	// initialize form validation	
	$z("form.zp-form").each(function (){
		var formID = "#" + $z(this).attr("id");
		
		$z(this).on("submit", function (e){
			var formIsValid = zpValidateForm(formID, e);
			if ( formIsValid && $z(this).hasClass("zpicaptcha") ){
				// validate invisible captcha which on success will submit the form
				e.preventDefault(); // preventDefault of zpValidateForm since reCaptcha will submit also
				grecaptcha.execute();
			}
		});
		
	});
	
	// apply some global form Styling
	
	// hide the as field - this is already done in styles.css but old custom layouts might not have an up-to-date css
	$z(".zp-form input.asfield").css("display", "none");
	
	// Hide each form's labels for browsers which support the placeholder attribute and if it is set - ignore zp-shop forms
	if ($z.support.placeholder){
		$z("form.zp-form:not(.zp-shopform):not(.zp14)").each(function (){
			var formID = "#" + $z(this).attr("id");
			var firstLabelsId = $z(this).find("label").first().attr("for");

			$z("form" + formID + ".zp-form input:text, .zp-form .typetext, .zp-form textarea").each(function (i){
				var currentFieldsId = $z(this).attr('id');
				
				if ( hideLabel($z(this)) ) {
					if ( currentFieldsId == firstLabelsId ){
						// only on first label in the form, we also set margin to 0
						//$z(".zp-form label[for='"+currentFieldsId+"']").css({"height":"0px", "overflow":"hidden", "opacity":"0", "margin":"0"});
						$z(".zp-form label[for='"+currentFieldsId+"']").css({"height":"0px", "overflow":"hidden", "opacity":"0"});
					}
					else{
						$z(".zp-form label[for='"+currentFieldsId+"']").css({"height":"0px", "overflow":"hidden", "opacity":"0"});
					}
				}
			});
		});
	}		

	// globally style recaptcha tables in Forms and give them a description in the title
	$z("#recaptcha_table").css({"border" : "1px solid #dfdfdf !important", "background-color" : "#ffffff"});
	$z("#recaptcha_table").attr('title', 'Um sicherzustellen, dass dieser Formularservice nicht missbräuchlich verwendet wird, geben Sie bitte die 2 Wörter im Feld unten ein.');
		
});

// validate forms
function zpValidateForm(formID, e)
{
	var focusablefields = [];
	var fieldstofill = "";
	var returncode = true;
	var invalidEmailMsg = $z("form"+ formID + " input[name='f_invalidEmailMsg']").val();
	if ( !invalidEmailMsg ){
		invalidEmailMsg = "keine gültige E-Mail";
	}
	
	function isValidEmail(email){
		var regex = /^[_a-z0-9-+]+(\.[_a-z0-9-+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,63})$/i;
		return regex.test(email);
	}
	
	function ValidateField (formID,theField){
		if ( $z("form" + formID + " *[name='F" + theField +"']").length === 0 ){ // it's probably a checkbox or select which has [] appended to the name to allow for multi values via a php array
			var $currentField = $z("form" + formID + " input:checkbox[name='F" + theField + "[]']");
			// reset error css styles
			$currentField.prev("label.field").css("color", "").css("text-shadow", "");
			$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("color", "");
			$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("text-shadow", "");
			
			if ( $z("form" + formID + " input:checkbox[name='F" + theField + "[]']").length && $z("form" + formID + " input:checkbox[name='F" + theField + "[]']:checked").val() === undefined ) {
				fieldstofill += ( $z("form" + formID + " #NAME" + theField).val() || "Feld " + theField ) + ", ";
				//console.log("Validating checkbox: " + "F" + formID.replace("#form", "") + "_" + theField + " / fieldsToFill: " + fieldstofill);
				returncode = false;
				$z("form" + formID + " input:checkbox[name='F" + theField + "[]']").attr("aria-invalid", true);
				
				// change the font color of the label to red to indicate the error
				$currentField.prev("label.field").css("color", "red").css("text-shadow", "1px 1px 0 #ffffff");
				// if the label is empty (no text), add a warning-text
				if ( $currentField.prev("label.field").text() == "" ){
					$currentField.prev("label.field").html("Feld " + theField);
				}
				
				//$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("color", "red");
				//$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("text-shadow", "1px 1px 0 #ffffff");
			}
			
			if ( $z("form" + formID + " select[name='F" + theField + "[]']").length && !$z("form" + formID + " select[name='F" + theField + "[]']").val() ) {
				fieldstofill += $z("form" + formID + " #NAME" + theField).val() + ", ";
				returncode = false;
				$z("form" + formID + " select[name='F" + theField + "[]']").attr("aria-invalid", true);
				
				$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("color", "red");
				$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("text-shadow", "1px 1px 0 #ffffff");
			}
		}
		else{
			// it's not checkbox but a textfield or radio
			if ( (
				  	$z("form" + formID + " *[name='F" + theField +"']").attr('type') !== "radio" && 
				  	$z("form" + formID + " *[name='F" + theField +"']").val().trim() === ""
				 ) || 
				 (
					$z("form" + formID + " *[name='F" + theField +"']").attr('type') == "email" && 
					!isValidEmail( $z("form" + formID + " *[name='F" + theField +"']").val() )
				 ) ||
				 ( 
					$z("form" + formID + " *[name='F" + theField +"']").attr('type') == "radio" && 
					$z("form" + formID + " input:radio[name='F" + theField + "']").filter(":checked").val() === undefined
				 ) 
				) {
				
				var focusableFieldTypes = ["text","number","email","tel","url","date","time","color","search"];
				if ( focusableFieldTypes.indexOf($z("form" + formID + " #F" + formID.replace("#form", "") + "_" + theField).attr('type')) !== -1 || $z("form" + formID + " #F" + formID.replace("#form", "") + "_" + theField).is("textarea") ){
					focusablefields.push($z("form" + formID + " #F" + formID.replace("#form", "") + "_" + theField)); 
				}
				if ( $z("form" + formID + " #F" + formID.replace("#form", "") + "_" + theField).attr('type') == "email" && $z("form" + formID + " *[name='F" + theField +"']").val() !== "" ){
					fieldstofill += $z("form" + formID + " #NAME" + theField).val() + " (" + invalidEmailMsg + "), ";
				}
				else{
					fieldstofill += $z("form" + formID + " #NAME" + theField).val() + ", ";
				}
				returncode = false;

				$z("form" + formID + " *[name='F" + theField +"']").attr("aria-invalid", true);
				$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("color", "red");
				$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("text-shadow", "1px 1px 0 #ffffff");
				$z("form" + formID + " #F" + formID.replace("#form", "") + "_" + theField).css("border", "1px solid red");
			}
			else{
				// reset error css styles
				$z("form" + formID + " *[name='F" + theField +"']").removeAttr("aria-invalid");
				$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("color", "");
				$z("form" + formID + " label[for='F" + formID.replace("#form", "") + "_" + theField + "']").css("text-shadow", "");
				$z("form" + formID + " #F" + formID.replace("#form", "") + "_" + theField).css("border", "");
			}
		}
	}

	function validRecipient(){
		// validate recipient field and make sure it's not the widget's default example address
		if ( $z("form" + formID +" input[name='f_receiver']").val() == "MnNuM+WvvqJiFHfRswZ0Mhk2iaispZmP" ){
			returncode = false;
			return false;
		}
		return true;
	}

	// only validate fields, if the recipient is not not the widget's default example address in which case we error out enyway
	if ( validRecipient() ){
		// call ValidateField(339,1); -> "ValidateField(FormID,FieldINDEX);" for every required field 
		$z("form" + formID + " .required").each(function (){
			var fieldName = $z(this).attr("name");
			fieldName = fieldName.replace("F", "").replace("[]", "");
			ValidateField(formID, fieldName);
		});
		// validate not required E-Mail fields which are not empty
		// $z("form#form1630 input[type=email]:not(.required)")
		$z("form" + formID + " input[type=email]:not(.required)").each(function (){
			if ( $z(this).val() !== "" ){
				var fieldName = $z(this).attr("name");
				fieldName = fieldName.replace("F", "").replace("[]", "");
				ValidateField(formID, fieldName);
			}
		});
	
		// do captcha validation if captcha is included in form
		if ( $z("form" + formID + " #recaptcha_challenge_field").length > 0 ){			// reCaptcha 1.0
			$z.ajaxSetup({
				error: function(jqXHR, exception) {
					if (jqXHR.status === 0) {
							alert('Not connected. Please verify your network.');
					} else if (jqXHR.status == 404) {
							alert('ERROR: Requested page not found. [404]');
					} else if (jqXHR.status == 500) {
							alert('ERROR: Internal Server Error [500].');
					} else if (exception === 'parsererror') {
							alert('ERROR: Requested JSON parse failed.');
					} else if (exception === 'timeout') {
							alert('ERROR: Time out error.');
					} else if (exception === 'abort') {
							alert('ERROR: Ajax request aborted.');
					} else {
							alert('ERROR: Uncaught Error.' + jqXHR.responseText);
					}
				},
				async: false
			});
		
			var action_url = $z("form" + formID).attr("action");
			$z.post(action_url, { verifycaptcha: "yes", recaptcha_challenge_field: $z("form" + formID + " #recaptcha_challenge_field").val(), recaptcha_response_field: $z("form" + formID + " #recaptcha_response_field").val() },
				function(data) {				
					if ( data !== "OK"){
						returncode = false;
						fieldstofill += $z("form" + formID + " #recaptchalabel").text() + ", ";
						$z("form" + formID + " #recaptchalabel").css("color", "red");
						$z("form" + formID + " #recaptchalabel").css("text-shadow", "1px 1px 0 #ffffff");
						$z("form" + formID + " #recaptcha_table").attr("style", "border: 1px solid red !important");
					}
					else{
						$z("form" + formID + " #recaptchalabel").css("color", "");
						$z("form" + formID + " #recaptchalabel").css("text-shadow", "");
						$z("form" + formID + " #recaptcha_table").removeAttr("style");
					}
				}
			);
		}
	
		if ( $z("form" + formID + " div.g-recaptcha").length > 0 && !$z("form" + formID).hasClass("zpicaptcha") ){ 		// reCaptcha 2.0 visible (invisible has class .zpicaptcha)
			var cr = grecaptcha.getResponse();
			if ( cr.length === 0 ){
				// captcha hasn't been filled/verified
				returncode = false;
				fieldstofill += $z("form" + formID + " #recaptchalabel").text() + ", ";
				$z("form" + formID + " #recaptchalabel").css("color", "red");
				$z("form" + formID + " #recaptchalabel").css("text-shadow", "1px 1px 0 #ffffff");
				$z("form" + formID + " .g-recaptcha").css("border", "1px solid red").css("width", "304px");
			}
			else{
				$z("form" + formID + " #recaptchalabel").css("color", "");
				$z("form" + formID + " #recaptchalabel").css("text-shadow", "");
				$z("form" + formID + " .g-recaptcha").css("border", "").css("width", "");
			}
		}
		
		// validate zCaptcha if included in form
		if ( $('input[name="zpasans"]').length > 0 ){
			var zcQ = $('form' + formID + ' input[name="zpasq"]').val();
			var zcA = $('form' + formID + ' input[name="zpasans"]:checked').val();
			
			$z.ajaxSetup({
				error: function(jqXHR, exception) {
					if (jqXHR.status === 0) {
							alert('Not connected. Please verify your network.');
					} else if (jqXHR.status == 404) {
							alert('ERROR: Requested page not found. [404]');
					} else if (jqXHR.status == 500) {
							alert('ERROR: Internal Server Error [500].');
					} else if (exception === 'parsererror') {
							alert('ERROR: Requested JSON parse failed.');
					} else if (exception === 'timeout') {
							alert('ERROR: Time out error.');
					} else if (exception === 'abort') {
							alert('ERROR: Ajax request aborted.');
					} else {
							alert('ERROR: Uncaught Error.' + jqXHR.responseText);
					}
				},
				async: false
			});
			// verify zCaptcha vie AJAX
			var action_url = $z("form" + formID).attr("action");
			//console.log("Verifying zCaptcha vie Ajax");
			$z.post(action_url, { zCaptchaQ: zcQ, zCaptchaA: zcA, f_id: formID.replace("#form","")},
				function(data) {
					//console.log("zCaptcha Response: " + data);
					if ( data == "NOK"){
						returncode = false;
						fieldstofill += $z("form" + formID + " label#zpasq span").first().text() + ", ";
						$z("form" + formID + " label#zpasq span").first().css("color", "red").css("text-shadow", "1px 1px 0 #ffffff");
						returncode = false;
					}
					else{
						$z("form" + formID + " label#zpasq span").first().css("color", "").css("text-shadow", "");
					}
				}
			);
		}
	}

	fieldstofill = fieldstofill.substr(0, fieldstofill.length - 2); //delete last comma and blank
	if ( fieldstofill !== "" || !validRecipient() ){
		var alertPrefix = $z("form"+ formID + " input[name='f_alertPrefix']").val();
		if ( !alertPrefix ){
			alertPrefix = "Bitte füllen Sie die rot markierten Felder korrekt aus:";
		}
		$z("form"+ formID+ " .formvalidateerror").remove();
		
		if ( !validRecipient() ){
			$z("form"+ formID).prepend('<div class="formvalidateerror" style="color: #fff; background-color: red; padding: 6px 12px; margin-bottom: 20px;"><p>Die E-Mail-Adresse des Formularempfängers ist ungültig.<br /> <strong>Der Betreiber der Website sollte die Formularkonfiguration überprüfen.</strong></p><p>The recipient-email of the form is invalid.<br /> <strong>The owner of this website should verify the form-configuration.</strong></p></div>');
		}
		else{
			$z("form"+ formID).prepend('<div class="formvalidateerror" style="color: #fff; background-color: red; padding: 6px 12px; margin-bottom: 20px;"><p>' + alertPrefix + '<br/><strong>' + fieldstofill + '</strong></p></div>');
		}
		
		// find the first element on the page with position fixed and if it is visible and its top is 0, 
		// it is most likely a fixed navigation we need to compensate for
		var firstFixedElement = $z('*:not(.alertbanner)').filter(function () { 
			return $z(this).css('position') == 'fixed';
		}).first();
		if ( firstFixedElement.length == 1 && firstFixedElement.is(":visible") && parseInt(firstFixedElement.css("top")) == 0 ){
			var fixedElementHeight = parseInt(firstFixedElement.css("height"));
			// some layouts already compensate fixed navs with a body-top-padding, so subtract that
			fixedElementHeight = fixedElementHeight - parseInt($z("body").css("padding-top"));
		}
		else{
			var fixedElementHeight = 0;
		}
	
		$z('html, body').animate({
			scrollTop: $z("form"+ formID+ " .formvalidateerror").first().offset().top - fixedElementHeight - parseInt($z("body").css("padding-top"))
		}, 500);
		
		$z(focusablefields[0]).trigger("focus");
	}
	
	if ( !returncode ){
		e.preventDefault();
	}

	return returncode;
}
