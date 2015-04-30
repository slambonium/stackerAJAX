$(document).ready( function() {

	/* http://api.stackexchange.com/ */

	/* http://api.stackexchange.com/docs/unanswered-questions */

	/* http://api.stackexchange.com/docs/top-answerers-on-tags */

	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

	$('.inspiration-getter').submit( function(event){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tag the user submitted
		var tag = $(this).find("input[name='answerers']").val();
		getTopAnswerers(tag);
	});

}); /* end $(document).ready(function() {...}) */

// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	/* http://api.jquery.com/clone/ */
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
 							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
}; /* end function showQuestion() */

// this function takes the user object returned by StackOverflow 
// and creates new result to be appended to DOM
var showAnswerer = function(user) {
	
	// clone our result template code
	/* http://api.jquery.com/clone/ */
	var result = $('.templates .answerer').clone();
	
	// Set the answerer-info properties in result

	// set href value
	result.find('.answerer-info a').attr('href', user.user.link);
  // assign image url
  result.find('img').attr('src', user.user.profile_image);
  // assign figcaption contents
  result.find('figcaption').text(user.user.display_name);

  // assign score property 
  result.find('.score').text(user.score);
  // assign reputation property 
  result.find('.reputation').text(user.user.reputation);  

	return result;
}; /* end function showAnswerer() */


// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

/*

getUnanswered function calls the other functions in the middle of the file. getUnanswered first creates an object that contains the parameters which will be passed in the GET request to the StackExchange API.

Next, a variable is created whose value is a deferred object (this is the underlying object returned by the $.ajax() method). In the call to .ajax(), for the url setting, the endpoint from step 3 gets passed. For the data key, you pass in the requestParams object you created above. Since you want a client-side cross-domain request to this API, you must specify “jsonp” (http://bob.ippoli.to/archives/2005/12/05/remote-json-jsonp/) for the dataType setting. Finally, set the method to “GET” since this is the HTTP method used.

The logic in the .done() and .fail() blocks is similar. Remember that the .done() block will only execute when and if the AJAX returns successfully. The .fail() block will only execute when and if the AJAX request fails. In both cases, the strategy (looking at the code for the showQuestion, showSearchResults and showError functions) is to .clone() - http://api.jquery.com/clone/ - the appropriate hidden DOM element, insert new text and HTML into the clone based on our response data, then insert this cloned element into the visible .container div.

This is a simple design pattern that you can use again and again when you’re prototyping a AJAX-based web page. If you were building a full-fledged application, you would probably want to start thinking about storing your templates as partials that you could also load using AJAX. This would make your app more modular.

There are some additional implementation details in the showQuestion, showSearchResults, and showError functions that you should review on your own. In the next assignment, you will take the principles demonstrated here and apply them to building a second feature for this web page.

*/

var getUnanswered = function(tags) {
// takes a string of semi-colon separated tags to be searched
// for on StackOverflow	
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	
	var result = $.ajax({
		/* http://api.jquery.com/jQuery.ajax/ */
		/* http://api.stackexchange.com/docs/unanswered-questions */
		url: "//api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		/* http://bob.ippoli.to/archives/2005/12/05/remote-json-jsonp/ */
		type: "GET",
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});

}; /* end function getUnanswered() */

var getTopAnswerers = function(tag) {
// takes a string of one tag to be searched
// for on StackOverflow	

  /* sample: http://api.stackexchange.com/2.2/tags/php/top-answerers/all_time?site=stackoverflow&dataType=text&type=GET */
	
	// the parameters we need to pass in our request to StackOverflow's API
	/* tags/{tag}/top-answerers/{period} : http://api.stackexchange.com/docs/types/tag-score */
	var request = {tag: tag + '/top-answerers/all_time',
		            // period: 'all_time',
		            //period: 'month',
								site: 'stackoverflow',
					      };
	
	var result = $.ajax({
		/* http://api.jquery.com/jQuery.ajax/ */
		/* http://api.stackexchange.com/docs/unanswered-questions */
		// url: "http://api.stackexchange.com/2.2/tags/",
		url: "//api.stackexchange.com/2.2/tags/" + tag + '/top-answerers/all_time?site=stackoverflow',
		// data: request,
		// data: tag + '/top-answerers/all_time/site=stackoverflow',
		dataType: "jsonp",
		/* http://bob.ippoli.to/archives/2005/12/05/remote-json-jsonp/ */
		type: "GET",
		})
	.done(function(result){
		// var searchResults = showSearchResults(request.tag, result.items.length);
		var searchResults = showSearchResults(tag, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var answerer = showAnswerer(item);
			$('.results').append(answerer);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});

}; /* end function getTopAnswerers() */	




