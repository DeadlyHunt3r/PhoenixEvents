/*! 
 * ZP Teaser Widget
 * Copyright $Date$ Zeta Software GmbH
 */
$z(document).ready(function () {
	// ******* ZP Teaser *******
	$z(".zpteasertext").toggle();
	$z(".zphidelink").toggle();
	$z(".zpteaserlink").on("click", function (event){
		event.preventDefault();
		$z(this).toggle();
		$z(this).next(".zpteasertext").slideDown("fast");
		$z(this).nextAll(".zphidelink").toggle();
		return false;
	});
	$z(".zphidelink").on("click", function (event){
		event.preventDefault();
		$z(this).toggle();
		$z(this).prevAll(".zpteasertext").slideUp("fast");
		$z(this).prevAll(".zpteaserlink").toggle();
		return false;
	});
});

