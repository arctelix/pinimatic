//Global Variables
//STATIC_URL passed from base.html template context
//var aProfileId passed from user_profile template tag
var pinsURL = apiURL+'pin/?format=json&offset='
var pinURL = apiURL+'pin/'
var cmntURL = apiURL+'cmnt/'
//var favsURL = apiURL+'favs/?format=json&'
var userURL = apiURL+'auth/user/?format=json'
var page = 0;
var handler = null;
var handlerT = null;
var cTag = null;//used to track current tag
var cTags = null;//not used yet for list of current tag filters
var cUser = null;//used to track current user
var isLoading = false;
var pinsPrefix = ""; //url required for access to pins url's (defined in pinry.urls for include: pinry.pins.urls)
var apiPrefixA = ["user", "profile"];//prefix for recent-pins (defined in pins.urls recent-pins) determines when to use pins api in below funcions
var aProfile = $('.pin.profile');
var aProfileO = {username:aProfile.attr('data-profile'), id:parseInt(aProfile.attr('id'))};
//var aProfileU = aProfile.attr('data-profile');
var pinA = [];
var origin = window.location.origin;
console.log(origin);
var av=url(3);//active view
var authUserO = ajax(this, false, userURL, false);//authenticated user object//used to determine current authenticated user
console.warn('authUserO:',authUserO)
var aTouchHover //tracks active pin options floater for touch devices
var vn = { //viewname:"displayname"
	favs:"Favorites",
	tags:"Groups",
	pins:"Pins",
	fing:"Following",
	fers:"Followers",
	cmnts:"Comments",
	pop:"Popular"
}
//determines weather or ot to loadData() on page load http://domain/apiPrefix/
function is_apiDomain(){
	return inArray(url(1), apiPrefixA);
}
var state = {tag:undefined, user:undefined, initial:true}//state object passed to pushstate on each state change
//redirect to http when in api domain
if (is_apiDomain()){
	if (url('protocol') == 'https'){
		console.log('---redirect to http-----')
		addr = url(0)
		port = url('port')
		console.log(port)
		unsecure = addr.replace(port, '5000')
		unsecure = unsecure.replace('https', 'http')
		console.log('unsecure',unsecure)
		window.location = unsecure
		throw new Error('Redirecting');
	}
}
//add loading img to target's submit button or target innerHTML
function submitProgress(target){
	var btn = target.find("button[type='submit']")
	if (!btn.length) btn = target;
	var img = $('<img class="load-img">');
	img.attr('src', STATIC_URL+'core/img/loader.gif');
	img.css('max-height', '10px');
	img.css('width', 'auto');
	btn.html(img)
}
//TOUCH: USER AGENT DETECTION 
//alert('user agent: '+navigator.userAgent)
//"/Android|webOS|iPhone|iPad|iPod|BlackBerry/i"
//set up screen size
var ios
if( /iPhone|iPod/i.test(navigator.userAgent) ) {
	$('head').append('<meta name = "viewport" content = "initial-scale = .6">');
	ios = true
}
if( /iPad/i.test(navigator.userAgent) ) {
	$('head').append('<meta name = "viewport" content = "initial-scale = 1.0">');
	ios = true
}
var ie10
if (navigator.msMaxTouchPoints>0){ie10 = true}

//TOUCH: TEST FOR TOUCH DEVICE & Setup touch devices
var touchOn = 'ontouchstart' in window || (navigator.msMaxTouchPoints>0);
function setUpTouch(s) {
	if (s){
		$('.touch-off').toggleClass('touch-on touch-off');
		$('.touch-on.hide').toggleClass('hide show');
		touchOn = true
	}
	if (!s){
		$('.touch-on').toggleClass('touch-off touch-on');
		$('.touch-on.show').toggleClass('show hide');
		touchOn = false
	}
	console.warn('touchOn: ',touchOn)
};
//handle touch/mouse devices
var lastTouch = 0
var lastMouse = 0
function realMouseDown(){
	dif = lastMouse-lastTouch
	console.log(dif)
	if (ie10 && dif > 60){
		return true
	}else if(dif > 500){
		return true
	}else{return false}

}
if (!ios){
	$("body").bind("MSPointerDown touchstart mousedown", function (event) {
		console.log(event.type)
		if (event.type=="touchstart"){
			lastTouch = event.timeStamp
			if (!touchOn) setUpTouch(true);
		}
		if (event.type=="MSPointerDown"){
			lastTouch = event.timeStamp
			if (!realMouseDown() && !touchOn) setUpTouch(true);
		}
		if (event.type=="mousedown" && touchOn){
			lastMouse = event.timeStamp
			if (realMouseDown() && touchOn){
				setUpTouch(false)
			}
		}
		
	});
}

/** GENERIC FUNCTION FOR AJAX CALLS:
 *url: url to make ajax call
 *async: Boolien false makes non async call, Defaults to true
 *cbS: success call back function name
 *cbE: error call back function name
 *reqType: default='GET'
 */

function ajax(messageTarget, reload, url, async, reqType, cbS, cbE, data){
	if (async == undefined) async = true;
	if (reqType == undefined) reqType = 'GET';
	var rData

	onApiData = function( data, ajaxStatus, xhr) {
		var statusCode = xhr.status;
		var statusText = xhr.statusText;
		//precess & display ajax messages
		var jsonMessage = getMessages(xhr, $(messageTarget))
		alertFade()//display and fade messages
		//if callback exicute call back
		if (cbS){
			cbS(data, ajaxStatus, xhr)
		//if one object is returned return the object
		}else if(statusText != "NO CONTENT" && data.objects.length==1){
				console.log('one one object returned below:')
				console.log(data.objects[0])
				rData = data.objects[0]
		//return all data
		}else{
			rData = data
			console.log('streight data returned below:')
			console.log(rData)
		}
		//TODO: im not sure what the below if was for but everyting seems to be ok without it.
		//if (authUserO && authUserO.id == aProfileO.id || !aProfileO.id){
		if (reload){
			console.log('--TODO:eliminate need for this--reloading data after ajax')
			loadData(undefined, undefined, true)//reloads page & data
		}
		//}
	}
	function onApiError(xhr, settings, what) {
		//TODO: may wnat to change tastypie form field error responce if possible to success.....
		var jsonMessage = getMessages(xhr, $(messageTarget))
		alertFade()//set messages to fade out
		if (cbE){cbE(xhr, settings, what)}else{console.warn('ajax()error: ',xhr, settings, what)};
	}
	console.log('-ajax - 1 custom ajax()');

	$.ajax({//1 custom ajax function
		context: messageTarget,
		url: url,
		type: reqType,
		contentType: 'application/json',
		data: data,
		//dataType: 'json', 
		processData: false,
		headers:  {
			//'x-requested-with' : 'XMLHttpRequest' //// add header for django form.is_valid() 
		},
		xhrFields: {
			//withCredentials: true //// add credentials to the request
		},
		/* //CSRF token handled by ajax setup function.
		beforeSend: function(jqXHR, settings) {
			//jqXHR.setRequestHeader('X-CSRFToken', $('input[name=csrfmiddlewaretoken]').val());
		}, */
		//TODO: what is getApiData doing???? i don't think its used any more. test!
		success: onApiData,
		error: onApiError,
		async: async,
	});
	if (!cbS) return rData;
}

/**
 * Endless Scroll: Based on Wookmark's endless scroll.
 */

//TODO TEST: fix error with manual scroll jitter, better with below (possibly need to stop ajax calls when no data left via pages??

//When scrolled all the way to the bottom, add more tiles.
function onScroll(event) { 
  if(!isLoading && is_apiDomain()) {
      var closeToBottom = ($(window).scrollTop() + $(window).height() > $(document).height() - 100);
      if(closeToBottom) loadData();
  }
};



//format pin grid and apply layout to all laoded pins
function applyLayout() {
  $('#pins-container').imagesLoaded(function() {
      // Clear our previous layout handler.
      if(handler) handler.wookmarkClear();
      
      // Create a new layout handler.
      handler = $('#pins-container .pin');
      handler.wookmark({
          autoResize: true,
          offset: 4,
          itemWidth: 242
      });
	  //show hidden static pins in tempate
	  $('.load.hide').show();
  });
};
//use to apply layout to each pin as loaded
function applyLayout1(pinId) {
  $("#"+pinId+'-pin').imagesLoaded(function(e) {
      // Clear our previous layout handler.
	  console.log('--imagesloaded---')
      if(handler) handler.wookmarkClear();
      
      // Create a new layout handler.
      handler = $('#pins-container .pin');
      handler.wookmark({
          autoResize: true,
          offset: 4,
          itemWidth: 242,
		  show: false
      });
	  //show hidden static pins in tempate
	  $('.load.hide').show();
	  //show last pin to load
	  $("#"+pinId+'-pin').show()
  });
};
//apply layout to pin grid for tag/group covers
function layoutThumbs(target) {
  $(target+' .thumbs').imagesLoaded(function() {
      // Clear our previous layout handler.
      if(handlerT) handlerT.wookmarkClear();
      
      // Create a new layout handler.
      handlerT = $(target+' .thumb.board');
      handlerT.wookmark({
		  container: $(target),
          autoResize: true,
          offset: 2,
          itemWidth: 68
      });
  });
};

/**Loads data from the API. 
 * relaod option: true reloads page after data loaded
 * set tag / user to null to clear
 * set tag / user to undefined to keep current filters.
 */
function loadData(tag, user, reload, popstate) {
	//make tag urlsafe
	if(typeof tag == "string"){tag = urlSafe(tag)}
	//default values
	if (reload === undefined){reload = false};
	if (popstate === undefined){popstate = false};
	if (user === null){user = 'all'};
	var cTag
	var cUser
	//loader
    isLoading = true;
    $('#loader').show();
	console.log('+++state: ',state)
	//check if the window is in apiDomain
	var apiPrefix = is_apiDomain();

	console.log('----loadData(): tag:'+tag+' user: '+user+' apiPrefix: '+apiPrefix+' reload: '+reload)
	
	//check url for current user / tag
	if (url(2) && apiPrefix) {
		console.log('url(2)sets cUser to: '+url(2));
		cUser = url(2);
		var nAddress = '/'+apiPrefix+'/';
	}
	if (url(3) && apiPrefix) {
		console.log('url(3) sets cTag to : '+url(3));
		cTag = url(3);
    }else{
		cTag = null;
	}
	
	//catch undefined when not in api domain
	if (!is_apiDomain()){
		
		if (user === undefined & cUser == undefined){
			user = 'all'
		}
		if (tag === undefined & cTag == undefined){
			tag = ''
		}
		nAddress = '/user/'
	}

	//if new user or tag specifiled overide url and current user & tag acordingly.
	if (user) {
		nAddress += user+'/';
		console.log('if user update url to: '+nAddress);
	}else if (cUser) {
		user = cUser;
		nAddress += user+'/';
		console.log('else if cUser update url to: '+nAddress);
	}
	if (tag){//*add support for multi tags with cTags, maybe peramiter url is better??
		nAddress += tag+'/';
		console.log('if tag update url to: '+nAddress);
	}else if (cTag && tag !== null){
		tag = cTag;
		nAddress += cTag+'/';
		console.log('else if cTag update url to: '+nAddress);
	}
	
	//add active tag to tag display div
	if (tag){
		$('#tags').show();
		$('#tags .tags').html('<span class="label tag" onclick="loadData(null)">' + displaySafe(tag) + ' x</span>');
	}else{
		$('#tags').hide();
	}

	//if current tag has a view convert tag name to defined view
	av = getKey(tag, vn)
	/*debug
	console.log('tag = '+tag)
	console.log('cTag = '+cTag)
	console.log(tag !== undefined && tag !== cTag )
	console.log('user = '+user)
	console.log('cUser = '+cUser)
	console.log(user !== undefined && user !== cUser)
	console.log('av = '+av)
	console.log('av name = '+vn[av])
	console.log(vn[av] !== cTag)
	 */
	
	
	/* //redirect and stop script when not in apiDomain 
	if (!apiPrefix){
		//TODO:working but needs tags & checks
		
	}  */
	if (!popstate  && !apiPrefix){
		console.log('!popstate')
		window.location = nAddress;
		$('#pins').html('');
		throw new Error('Redirected by loadData()');
	}
	console.warn('-relaod: ', reload)
	//reset page and refresh pins display
	if (reload || tag !== undefined && tag !== cTag || user !== undefined && user !== cUser || vn[av] !== undefined && vn[av] !== cTag){
		console.warn('----page reset')
		page = 0;
		$('#pins').html('');
	}
	//make api url
	console.log('page: '+page);
    var loadURL = pinsURL;
	
	//if current tag has a view setup ajax for view
	console.log('active view set to:'+av);
	
	if (av == 'pop') {
		loadURL += (page*30)+"&pop&sort=popularity"
		//loadURL =pinURL+'?favorites__isnull=false&format=json&offset='+page*30
		tag = null
	}else if (av == 'favs') {
		loadURL += (page*30)+"&favs=" + user;
		user = null
		tag = null
	}else if (av == 'tags') {
		//TODO: Rework group display so that the server returns groups with pins alredy assigned.
		//temp increased pins to 1000 to insure all groups are made.
		loadURL += (page*1000)
		tag = null
	}else if (av == 'fing') {
		loadURL += (page*30)+"&fing=" + user;
		user = null
		tag = null
	}else if (av == 'fers') {
		loadURL += (page*30)+"&fers=" + user;
		user = null
		tag = null
	}else if (av == 'cmnts') {
		loadURL += (page*30)+"&cmnts=" + user;
		user = null
		tag = null
	}else{
		loadURL += (page*30)
	}
	
	//set api perameters
	if (user && user != 'all') loadURL += "&user=" + user;
    if (tag && tag !== null) loadURL += "&tag=" + tag;
	
	//set state object
	state.tag = tag;
	state.user = user;
	console.log('state: ');console.log(state);
	//updated push state for forward/back navigation
	console.log('final url = '+nAddress);
	console.log('curren url(path) = '+url('path'));
	console.log('ok for push state:', nAddress != url('path'));
	if (nAddress && nAddress != url('path')){
		window.history.pushState(state, 'Pinry: '+nAddress, nAddress);
		console.log('PUSH STATE ADDED:'+nAddress);
		console.log('new url(path) = '+url('path'));
	}

	//prevent api request when not in apiPrefix domain
	if (url(1) == apiPrefix) {
		console.log('-ajax - 2 loaddata()');
		$.ajax({//2 load data
			url: loadURL,
			contentType: 'application/json',
			/* headers:  {
				'x-requested-with' : 'XMLHttpRequest' //// add header for django form.is_valid() 
			},
			beforeSend: function(jqXHR, settings) {
				jqXHR.setRequestHeader('X-CSRFToken', $('input[name=csrfmiddlewaretoken]').val());
			}, */
			success: onLoadData,
			error: function(jqXHR, settings) {
				console.warn('ladData - ajax error');
				isLoading = false
				$('#loader').hide();
			},
		});
	}else{
		isLoading = false
		$('#loader').hide();
	}
};

/** Reloads page on state change 
 *  keep below loadData
 */

window.onpopstate = function(e) {
	console.log('---popstate called---');
	//handle forward/back in api domain
	if (is_apiDomain()){
		if (e.state && !state.initial) {
			console.log('popstate redireccting to e.state: ', e.state);
			loadData(e.state.tag, e.state.user, true, true);
		}
		if (!e.state && !state.initial) {
			console.log('popstate !e.state redireccting to undefined: ');
			//when there is not e.state reset to user & tag to undefined (home)
			loadData(undefined, undefined, true, true);
			//window.location.href = url('path')
		} else {
			console.log('--popstate setting initial: false');
			state.initial = false; 
		}
		//enables typical state forward and back
		resetForms();
	}
};
/**Receives data from the API, creates HTML for images and updates the layout
 * insert: set to "prepend" to prepend existing HTML, "exclude" appends data to existing HTML.
 */
function onLoadData(data, insert) {
    applyLayout();//for static pins
	data = data.objects;
	page++;
	var maxImages = 10 //max images to include on tag/group pin flow cover
	var minImages = 7 //min images to include on tag/group pin flow cover
	var tags = {}
	var i=0, length=data.length, image;
	for(; i<length; i++) {
		image = data[i];
		var html = '';
		var userFav = 'False'
		var userPin = 'False'
		var userCmnt = 'False'
		var repined = 'False' //TODO: used to determine if pin has been repined by authUser
		//layout for all views except for those listed below
		if (av != 'tags'){
			console.log('onLoadData() av != tags')
			
			//package pin data for js access(req for repin)
			pinA[image.id] = {
				srcUrl:image.srcUrl,
				imgUrl:image.imgUrl,//CHECK: this was changed from origin+image.image, if it works we dont need origin
				//the origin did not work with heroku due to amazon
				//thumbnail:origin+image.image,
				repin:image.id,//:TODO: this may need to be just id or pin object???
			};
			
			if (authUserO){
				for (f in image.favorites){
					if (image.favorites[f].user.id == authUserO.id){
						userFav = 'True';
					}
				}
				for (r in image.repins){
					if (image.repins[r].submitter.id == authUserO.id){
						repined = 'True';
					}
				}
				for (c in image.comments){
					if (image.comments[c].user_id == authUserO.id){
						userCmnt = 'True';
					}
				}
				if (image.submitter.id == authUserO.id){
					userPin = 'True'
				}
			}
			//SETUP HTML FOR LARGE PINS DISPLAY
			html += '<div class="pin item" id="'+image.id+'-pin" data-favs="'+image.favorites.length+'" data-cmnts="'+image.comments.length+'" data-repins="'+image.repins.length+'">';
			//IMAGE CONTAINER
				html += '<div class="image touch-off">';
			//OPTIONS
					if (authUserO.id !== 'anon'){
					//was used to toggle options//html += '<div class="pin-options-btn touch-off hide"><i id="optionsBtn" class="icon-cog"data-state="False" title="Show Options"></i></div>';
					html += '<div class="pin-options">';
			//PIN OPTIONS BUTTON
						html += '<div class="background-50 btn-lg">';
							if (userPin == 'True' || authUserO.is_superuser){
							html += '<div id="delete" title="Delete" class="inline option">'
								html += '<a href="'+pinsPrefix+'/delete-pin/'+image.id+'/">';
								html += '<i class="icon-trash"></i>'
								html += '<br>Delete</a></div>';
							html += '<div id="edit" title="Edit" class="inline option">'
								html += '<a href="'+pinsPrefix+'/edit-pin/'+image.id+'/">';
								html += '<i class="icon-edit"></i>'
								html += '<br>Edit</a></div>';
							}
							html += '<div id="favs" data-state="'+userFav+'" class="inline option">'
								html += '<a href="'+pinsPrefix+'/fav-pin/'+image.id+'/">'
								if (userFav == 'True') {
								html += '<i title="Remove Favorite" class="icon-star icon-star-empty"></i>';
								} else {
								html += '<i title="Add Favorite" class="icon-star"></i>';
								};
								html += '<br>Fav</a></div>'
							if (userPin == 'False' && repined == 'False'){
							html += '<div id="repins" data-state="'+userPin+'" title="Re-Pin" class="inline option">'
								html += '<a href="'+pinsPrefix+'/re-pin/'+image.id+'/">'
								html += '<i class="icon-plus"></i><br>Add</a></div>';
							}
							html += '<div id="cmnts" data-state="True" title="Comment" class="inline option">'
								html += '<a href="'+pinsPrefix+'/cmnt-pin/'+image.id+'/">'
								html += '<i class="icon-chat"></i><br>Comm</a></div>';
						html += '</div>';
			//SOURCE BUTTON
						html += '<div id="source" class="background-50 btn-lg">';
							html += '<a target="_blank" href="'+image.srcUrl+'">'
							html += '<div class="inline option one-icon"><i class="icon-bookmark"></i><br>GO</div>';
							html += '<div class="inline one-text">'+getHost(image.srcUrl)+'</div></a>';
						html += '</div>';
			//PIN NAVIGATION
						html += '<div id="details" class="background-50 btn-lg">';
							html += '<div id="info" title="Pin Details" class="inline">';
								html += '<a href="/pin/'+image.id+'/">';
									html += '<div class="inline option two"><i class="icon-info-sign"></i><br>Detail View</div>';
								html += '</a>';
							html += '</div>';
							html += '<div class="inline divider spacer"></div>';
							html += '<div id="large-image" title="Large Image" class="inline">';
								html += '<a href="">';
									html += '<div class="inline option two"><i class="icon-zoom-in"></i><br>Zoom Image</div>';
								html += '</a>';
							html += '</div>';
						html += '</div>';
					html += '</div>';
					}
			//IMAGE
					html += '<div class="img-btn touch-off"></div>';//prevent fancybox & toggle options
					html += '<a class="pin-img fancybox" rel="pins" href="'+image.image+'">';
					html += '<img src="'+image.thumbnail+'" width="200" ></a>';
				html += '</div>';
			//INFO - STATS
				//submitter
				html += '<div class="pin-info">';
					html += '<l><span class="">By: </span>'
					html += '<a class="pin-submitter" title="User\'s pins" href="/user/'+image.submitter.id+'/">'+image.submitter.username+'</a></l>';
				html += '</div>';
				//favs
				html +='<div class="pin-stats pull-right dropdown display favs">'
					html += '<div class="stat dropdown-toggle" id="dLabel" role="button" data-toggle="dropdown" data-target="#">'
					html += '<i class="icon-favs"></i><span class="text light favs ">'+image.favorites.length+'</span></div>';
					html += '<ul class="list-favs dropdown-menu dm-caret" role="menu" aria-labelledby="dLabel">';
					uu = uniqueUsers(image.favorites, 'user')
					for (u in uu){
						html += '<li id="'+uu[u].id+'" class="display favs item"><a href="/user/'+uu[u].id+'/">'+uu[u].username+'</a></li>';
					}
					html += '</ul>';
				html +='</div>'
				//cmnts
				html +='<div class="pin-stats pull-right dropdown display cmnts">'
					html += '<div class="stat dropdown-toggle" id="" role="button" data-toggle="dropdown" data-target="#">'
					html += '<i class="icon-cmnts"></i><span class="text light cmnts ">'+image.comments.length+'</span></div>';
					html += '<ul class="list-cmnts dropdown-menu dm-caret" role="menu" aria-labelledby="">';
					uu = uniqueUsers(image.comments, 'user')
					for (u in uu){
						html += '<li id="'+uu[u].id+'" class="display cmnts item"><a href="/user/'+uu[u].id+'/">'+uu[u].username+'</a></li>';
					}
					html += '</ul>';
				html +='</div>'
				//repin
				html +='<div class="pin-stats pull-right dropdown display repins">'
					html += '<div class="stat dropdown-toggle" id="" role="button" data-toggle="dropdown" data-target="#">'
					html += '<i class="icon-plus"></i><span class="text light repins">'+image.repins.length+'</span></div>';
					html += '<ul class="list-repins dropdown-menu dm-caret" role="menu" aria-labelledby="">';
					uu = uniqueUsers(image.repins, 'submitter')
					for (u in uu){
						html += '<li id="'+uu[u].id+'" class="display repins item"><a href="/user/'+uu[u].id+'/">'+uu[u].username+'</a></li>';
					}
					html += '</ul>';
				html +='</div>';
			//DESCRIPTION
				html += '<div class="pin-desc">';
					if (image.description) html += '<p id="desc">'+image.description+'</p>';
				html += '</div>';
			//TAGS
				html += '<div class="pin-tags section">';
				if (image.tags) {
					html += '<l>';
					html += '<span>Groups: </span>'
					for (tag in image.tags) {
						html += '<span class="tag" onclick="loadData(\'' + image.tags[tag] + '\')">' + image.tags[tag] + '</span> ';
					}
					html += '</l>';
				}
				html += '</div>';
			//COMMENTS
				if (authUserO){
					html += '<div class="section pin-cmnts">';
						if (image.comments){ 
							for (cmnt in image.comments) {
								//TODO: get user object from CmntResource instead or build one so user vars are consistant.
								//console.log(image.comments[cmnt])
								html += insertComment(image.comments[cmnt].username, image.comments[cmnt].user_id, image.comments[cmnt].comment, parseInt(image.comments[cmnt].id))
							}
						}
					}
				html += '</div>'//end pin-cmnts;
			html += '</div>'//end pin;

			//inserts pin into docuement
			if (insert=="prepend"){
				$('#pins').prepend(html);
			}else{
				$('#pins').append(html);
			}
			//
			//hide elements as required
			hidePinComponents(image.id)
			
			applyLayout1(image.id);//for each pin individual pin
		}//end typical view
		
		//lay out tags/group view
		if (av == 'tags'){
			console.log('-loadData-av == tags')
			//console.log('----setting up group: '+image.tags)
			
			//*TODO: seperate muti tags into individual tags
			//*TODO: Bug on groups scroll to bottom and url refresh (most likely related) check av flow.
			
			//build tags array for creation of tag/group covers
			for (key in image.tags){
				tag = image.tags[key]
				//add image.tags to tags array if it is not already there.  bump zero qty. to one
				if (!tags[tag]) {tags[tag]=1}else{tags[tag]=tags[tag]+1};
				//add group for each unique tag in tags array.
				if (tags[tag] == 1){
					tagId = idSafe(tag)
					html += '<div class="pin group" id="'+tagId+'">'
						html += '<a class="thumbs"></a>'
						html += '<div class="info">'
							html += '<h5><a class="title">'+tag+'</a></h5>'
							html += '<div class="details"></div>'
						html += '</div>'
					html += '</div>'
				}
			}//end for
			
			$('#pins').append(html);
			
			//for each tag/group in images.tags, add image to tag/group untill max images reached
			for (key in image.tags){
				tag = image.tags[key]
				console.log('image.tags: '+image.tags)
				console.log('key: '+key)
				console.log('image.tags[key]: '+image.tags[key])
				console.log('tag: '+tag)
				console.log('tags (below)')
				console.log(tags)
				console.log(tags[tag])
				//add images to group untill max images reached
				if (tags[tag] <= maxImages){
					tagId = idSafe(tag)
					console.log('--adding image to tag id: '+tagId)
					$('#'+tagId+' .thumbs').append('<div class="'+tagId+' thumb"><img src="'+image.thumbnail+'" alt=""></div>');
					w = image.image.wdth
					h = image.image.height
					//todo finish resize images for icon square, also change image ref to thumb.
				}
			}//end for
			applyLayout();
		}//end tag/group view
	}//end image for loop
	// for each tag add place holder images as required by min/max
	if (av == 'tags'){
		for (key in tags){
			tagId = idSafe(key)
			console.log('--key: '+key)
			console.log('--tagId: '+tagId)
			//for tags with one image
			if (tags[key]==1) {
				$('#'+tagId+' .thumbs .thumb').addClass('p1');
			//TODO: add formatting for other image quantities here.
			//add extra blank images for pin layout if there are not enough existing then apply the layout
			}else if (tags[key] <= maxImages){
				//console.log('--<10 key: '+key)
				$('#'+tagId+' .thumbs .thumb').addClass('board');
				var i=tags[key]
				while (i < maxImages){
					//console.log('--while adding images key: '+key)
					$('#'+tagId+' .thumbs').append('<div class="thumb board space"><img width="64px" height="2px" src="http://www.webdesign.org/img_articles/12337/1_002.jpg" alt=""></div>');
					i++;
				}
				//apply layout to pins in tag group
				layoutThumbs('#'+tagId);
			}
			//fix up layout after extra images added
			applyLayout();
		}
	}
	isLoading = false;
	$('#loader').hide();console.log('hiding loader')
	//Apply layout to show any static pins in template
	applyLayout();
	//TOUCH: DEVICE SETUP
	setUpTouch(touchOn)
};
//hide pin components with zero values
function hidePinComponents(id){
	pin = $('#'+id+'-pin')
	if (pin.data('repins') == 0) $('#'+id+'-pin .display.repins').hide()//hide repin stat display
	if (pin.data('favs') == 0) $('#'+id+'-pin .display.favs').hide()//hide fav stat display
	if (pin.data('cmnts') == 0) $('#'+id+'-pin .display.cmnts').hide()//hide cmmt stat display
	if (pin.data('cmnts') == 0) $('#'+id+'-pin .pin-cmnts').hide()//hide cmmt section
	$('#'+id+'-pin form[name="pin-cmnt-form"]').hide()//hide comment form
}
//not currently used
function hidePinComponentsAll(){
	pins = $('.pin.item')
	pins.each(function( index ) {
		hidePinComponents(parseInt($(this).attr('id')));
	});
}

function uniqueUsers(object,userO){
	unique = []
	for (o in object){
		id = object[o][userO].id
		if (!unique[id]){
			user = object[o][userO]
			unique[id] = user
		}
	}
	return unique
}
//TOUCH: form label tool-tips with ios support
$(document).on( 'MSPointerUp tosuchend', 'label[title]', function(e){	
	alert(e.target.title)
});

//DOCUMENT READY SETUP
$(document).ready(new function() {
	//TODO TEST: chanded $(document) to $(window) for ios compat
    //TODO TRY: does this need to be in doc ready? 
	$(window).bind('scroll', onScroll);
	//TODO: TOUCH: is this necessary?
	//$(window).bind('touchstart', onScroll);
	//$(window).bind('touchend', onScroll);
	//$(window).bind('touchcancel', onScroll);
	
	var _super = $.ajaxSettings.xhr;
	$.ajaxSetup({
		// Required for reading Location header of ajax POST responses in firefox.
		xhr: function () {
			console.log('-------------xhr setup xhr--');
			var xhr = _super();
			var getAllResponseHeaders = xhr.getAllResponseHeaders;
			xhr.getAllResponseHeaders = function () {
				var allHeaders = getAllResponseHeaders.call(xhr);
				if (allHeaders) {
					return allHeaders;
				}
				allHeaders = "";
				$(["Cache-Control", "Content-Language", "Content-Type", "Expires", "Last-Modified", "Pragma", "Location"]).each(function (i, header_name) {
					if (xhr.getResponseHeader(header_name)) {
						allHeaders += header_name + ": " + xhr.getResponseHeader(header_name) + "\n";
					}
				});
				return allHeaders;
			};
			return xhr;
		},
		headers: { "cache-control": "no-cache" },//to prevent ios safari from caching.
		//TODO: temp added for X-CSRFToken header
		beforeSend: function(xhr, settings) {
			console.log('-------------before send--');
			function getCookie(name) {
				var cookieValue = null;
				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = jQuery.trim(cookies[i]);
						// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
			}
			if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
				// Only send the token to relative URLs i.e. locally.
				xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
			}
		} 
	});

	//load initial pin data if in api prfix domain
	if (is_apiDomain()){
		loadData();
	}
});

/**On clicking an image show fancybox original.
 * 
 */
 //setup fancy box
$('.fancybox').fancybox({
    openEffect: 'none',
    closeEffect: 'none'
});
//set up #details button to trigger fancybox on click
$('.pin #large-image').live('click', function(e){
   e.preventDefault();
   fb = $(e.target).closest('.pin').find('.fancybox')
   fb.click();
});




/**Pin Functions.
 * 
 */
 
/* no longer needed //TOUCH: pin options button for touch devices
$(document).on('touchstart', '.pin-options-btn', function(e){
	 e.preventDefault();
	target = $(e.target).closest('.pin').find('.pin-options');
	toggleTouchHover(target)
}); */

//TOUCH: pin image overlay button for touch devices
$(document).on('click', '.pin.item .image.touch-on', function(e){
	//do not preventDefault() or inner option hrefs will not work.
	//e.preventDefault();
	//e.stopPropagation()
	target = $(e.target).closest('.pin').find('.pin-options');
	toggleTouchHover(target, true)
});
//Options > Comment: TOUCH: handler to toggle options hover for touch devices

$(document).on( 'MSPointerDown touchstart', '.pin-cmnt.touch-on .display', function(e){
	e.preventDefault();
	var cmnt = $(this).closest('.pin-cmnt')
	var opt = cmnt.find('.options')
	toggleTouchHover(opt)
}); 

//Options > Favorite
$('#favs').live('click', function(e){
	e.preventDefault();
	togglePinStat(this, 'icon-star-empty', 'POST', '/toggle/pins/Pin/');
});
//Options > Delete pin
$('#delete').live('click', function(e){
	e.preventDefault();
	//TODO: this is ugly try $(this).closest(".pin")
	var pin = $($(this).closest(".pin"));
	var id = parseInt(pin.attr('id'));
	console.log('del pin url: '+pinURL+id+'/')
	ajax(this, false, pinURL+id+'/', true, 'DELETE');
	pin.remove()
	applyLayout()
});

//Options > Repin:
$('#repins').live('click', function(e){
	e.preventDefault();
	var button = $(this);
	var name = button.attr('id');
	var state = button.attr('data-state');
	var pin = $($(this).closest(".pin"));
	var id = parseInt(pin.attr('id'));
	var data = pinA[id]//get data from pin arrray for this pin for form population
	//populate repin form
	$("#re-pin #id_srcUrl").attr("value", data.srcUrl);
	$("#re-pin #id_imgUrl").attr("value", data.imgUrl);
	$("#re-pin #id_repin").attr("value", data.repin);
	$("#re-pin #thumb_id").attr("src", data.imgUrl);
	//open repin form
	$('#re-pin.modal').modal('toggle')
});
//Options > repin: on form submit 
$('#re-pin-form').submit(function () { //// catch the form's submit event
	//ALT: this uses api to submit repin, alternitively use the ajax submit on python/js
	data = $(this).serializeObject()
	delete data.id
	sData = JSON.stringify(data)
	//replaced by toggle//ajax(this, false, pinURL, true, 'POST', onRepinSuccess, onRepinError, sData);
	var target = $("#"+data.repin+"-pin").find("#repins")
	togglePinStat(target[0], 'icon-plus-sign', 'POST', pinURL, null, sData, this)
	return false
});
function repinsSuccess(result, pin){
	console.log('---onRepinSuccess');
	//onLoadData requires data.objects
	data = []
	data['objects'] = [result];
	onLoadData(data, 'prepend');
	$('#re-pin').modal('toggle')
}

//Options > Comment: on click open form
$('#cmnts').live('click', function(e){
	e.preventDefault();
	state = $(this).attr('data-state');
	//only open form if data-stat = true
	if (state=="True"){
		var pin = $($(this).closest(".pin"));
		var id = parseInt(pin.attr('id'));
		pin.find('.pin-cmnts').append(insertCommentForm(id));
		pin.find('.pin-cmnts').show();
		applyLayout();
		//scroll to comment form
		ws = getWindowSize();
		centerH = (ws.height/2);
		centerW = (ws.width/2);
		console.log(centerW)
		pin.find('form[name="pin-cmnt-form"] textarea').focus();
		//causes issue with ios (temp removed)
		//$('body').animate({scrollTop: pin.find('form[name="pin-cmnt-form"]').offset().top-centerH}, 500);
		//$('body').animate({scrollLeft: pin.find('form[name="pin-cmnt-form"]').offset().left-centerW}, 200);
		$(this).attr('data-state', "False");
		icon = $(this).find('i');
		icon.toggleClass('icon-chat-empty');
	//if data-stat = false cancel comment form
	}else{
		cancelCmnt(this);
	}
});

//Comment: submit form
$(document).on( 'submit', '.pin form', function(e){
	e.preventDefault();
	data = $(this).serializeObject()
	console.log(data)
	//TODO: validate comment exist here with max length
	sData = JSON.stringify(data)
	var target = $(this).closest(".pin").find("#cmnts");//TODO: aply this tecnique throughout!!!!
	togglePinStat(target[0], 'icon-chat-empty', 'POST', cmntURL, null, sData)
	var pin = $(this).closest(".pin")
	submitProgress(pin)
});
//Comment: toggel callback
function cmntsSuccess(result, pin){
	cmnt = (pin.find('.pin-cmnt[data-cmnt='+result.id+']'))
	if(result && cmnt.length > 0){//edit comment
		cmnt.replaceWith(insertComment(result.username , result.user_id ,result.comment, result.id))//relace edited comment div with new comment
	}else if (result){//new comment
		pin.find('.pin-cmnts').append(insertComment(result.username , result.user_id ,result.comment, result.id))//append new comment to end of comments
	}else{//on delete
		pin.find('#cmnts').attr('data-state',true)
		pin.find('#cmnts i').toggleClass('icon-chat-empty');
	}
	//TODO:give posting indicator here
	pin.find('form[name="pin-cmnt-form"]').remove()//remove form
	applyLayout()
}
//Comment: cancel form click handler
$(document).on( 'click', '.pin form .cancel.btn', function(e){
	e.preventDefault();
	console.log('click cancel');
	cancelCmnt(this)
	//pcfp = pcf.parent('.pin-cmnt')
	//cmntp.replaceWith(insertComment(result.username , result.user_id ,result.comment))//relace edited comment div with new comment
});
//Comment: cancel form (for post & edit)
function cancelCmnt(target){
	var pin = $(target).closest(".pin");
	var button = pin.find("#cmnts");
	var pcf = pin.find('form[name="pin-cmnt-form"]');//pin comment form
	var cmnts = pcf.closest('.pin-cmnts');
	var cmnt1 = cmnts.find('.pin-cmnt');//first comment
	var cmntE = pcf.closest('.pin-cmnt');//current edit comment
	var opt = cmntE.find('.options');//options
	console.log(cmnts);
	console.log(cmnt1);
	console.log(cmntE);
	console.log(opt);
	pcf.remove();
	button.attr('data-state', 'true');
	icon = button.find('i');
	icon.toggleClass('icon-chat-empty');
	//if there are no existing comments hide the comment section
	if (!cmnt1[0]){cmnts.hide()}
	//if there is a comment being edited, show the original comment.
	if (cmntE[0]){cmnt.children().css('display', '')}//do not use .show()
	applyLayout();
}

//Comment: delete
$(document).on( 'click', '.pin-cmnt .delete', function(e){
	e.preventDefault();
	console.log('click delete');
	var cmnts = $(this).closest('.pin-cmnts');
	var cmnt = $(this).closest('.pin-cmnt')
	var id = cmnt.attr("data-cmnt");
	var button = $(this).closest(".pin").find("#cmnts");//TODO: aply this tecnique throughout!!!!
	togglePinStat(button[0], 'icon-chat-empty', 'DELETE', cmntURL, id)
	button.attr('data-state',true)
	//ajax(false, cmntURL+id+'/', true, "DELETE")
	cmnt.remove();
	//hide cmnt section if no more cmnts
	var cmnt1 = cmnts.find('.pin-cmnt');//first comment
	if (!cmnt1[0]){cmnts.hide()}
	applyLayout();
});

//Comment: edit
$(document).on('click', '.pin-cmnt .edit', function(e){
	var pin = $($(this).closest(".pin"));
	var button = pin.find("#cmnts");
	button.attr('data-state', 'edit');
	icon = button.find('i');
	icon.toggleClass('icon-chat-empty');
	var pinId = parseInt(pin.attr('id'));
	cmnt = $(this).closest(".pin-cmnt")
	cmntId = parseInt(cmnt.attr('data-cmnt'))//get comment id
	cmntT = cmnt.find('.display.text').html()//get comment text
	cmnt.children().hide()//hide existing comment
	cmnt.append(insertCommentForm(pinId, cmntT, cmntId))//add comment form
	applyLayout()
	pin.css('z-index', 1000);
});

//Comment: insert comment
function insertComment(username, userid, cmntT, cmntId){
	var html = ""
	if (!cmntId){cmntId=""};
	html += '<p class="pin-cmnt'
		if (touchOn){html += ' touch-on"'}else{ html += ' touch-off"'}
	html += ' data-cmnt='+cmntId+'>';
	if (userid == authUserO.id || authUserO.is_superuser){html += '<span class="options"><i class="edit icon-edit"></i><i class="delete icon-trash"></i></span>'}
	html += '<i class="icon-cmnts icon-gray"></i>';
	html += '<a href="/user/'+userid+'">' +username+': </a>';
	html += '<span class="display text light" >'+cmntT+'</span>';
	html += '</p> ';
	return html
}
//Comment: insert comment form
function insertCommentForm(pinId, cmntT, cmntId){
	var html = ""
	html += '<form action="" enctype="multipart/form-data" method="post" name="pin-cmnt-form" class="pin-cmnt-form form">';
		html += '<div id="div_comment" class="">'
			html += '<label id="comment_label" class="control-label" for="comment"></label>'
			html += '<span class="help-inline control-label"></span>'
			html += '<div class="controls">'
				console.log(cmntId)
				if (cmntId){html += '<input type="hidden" name="id" id="id_id" value='+cmntId+'>'}
				html += '<textarea id="id_comment" placeholder="Enter your comment here." name="comment">'
				if(cmntT){html += cmntT}
				html +='</textarea>'
				//html += '<input type="hidden" name="object_pk" value='+pinId+' id="id_object_pk">'
				//html += '<input type="hidden" name="content_type_id" value="10" id="id_content_type_id">'
				//html += '<input type="hidden" name="content_type" value="/api/v1/contrib/contenttype/10/" id="id_content_type">'
				html += '<input type="hidden" name="content_object" value="/api/v1/pin/'+pinId+'/" id="id_content_object">'
				html += '<input type="hidden" name="site_id" value=1 id="id_site_id">'
			html += '</div>'
			html += '<button href="" class="cancel btn btn-mini">Cancel</button>'
			html += '<button type="submit" class="btn btn-mini btn-primary">Post</button>'
		html += '</div>'
	html += '</form>';
	return html;
}

//TODO: integrate ajax funtion
//TODO: add follow function into this

/*Toggles Pin Status for options bar icos and for pin sats area, icons & counts: 
*  The following setup is required for this function to work properly.
*  NOTE: xxx is a unique name of the stat to toggle.
*  1) targetBtn: the HTML element acting as the toggle button
*  -must have: id="xxx" set staticly by onLoadData
*  -must have: data-state="true/false" current state of the toggle set dynamicly by onLoadData 
*  2).pin #id-Pin: must have: data-xxx="qty of stat"
*  -must have: class="display text xxx" to dispay the current count
*  -must have: class="display icon-iconname xxx" to display's the icon (must be 11px X 11p)
*  3) pin.profile: must have:data-xxx="qty of stat" 
*  -must have: class="display text xxx" to dispay the current count
*  4) Callback: if functtion xxxSuccess(result) is defined it will be triggerd result = returned data
*/

function togglePinStat(targetBtn, fIcon, type, url, id, data, messageTarget){
	var button = $(targetBtn);
	var icon = $(button).find('i')
	var name = button.attr('id');
	var state = button.attr('data-state');
	var pin = $($(targetBtn).closest(".pin"));
	//if no url set to pin url and current pin id
	if (url === undefined){
		url = ""
		id = ""
	//if url & no id get id from curent pin
	}else if (id === undefined){
		id = parseInt(pin.attr('id'));
		url = url+id+'/';
	//if id is null do not use id
	}else if (id === null){
		url = url
	//
	}else if (id){
		url = url+id+'/'
	}
	if (!type){ type = 'POST'};
	var count = pin.attr('data-'+name);
	var disp = pin.find('.display.'+name);
	var dispText = pin.find('.display.'+name+' .text');
	console.log(dispText)
	var countP = aProfile.attr('data-'+name);
	var dispTextP = aProfile.find('.display.'+name+' .text');
	var list = pin.find('.display .list-'+name);
	
	if (authUserO && authUserO.id == aProfileO.id) {
		var updateProfile = true;
	}
	//TODO: this was moved from onSuccess to speed it up, may be better with progress
	if (state == "True"){
		console.log('state == "True"')
		count--;
		countP--;
		button.attr('data-state', "False");
		icon.toggleClass(fIcon);
		pin.attr('data-'+name, count);
		dispText.html(count);
		list.find('#'+authUserO.id).remove()
		if (count == 0) {
			disp.hide();
		}
		if (updateProfile){
			aProfile.attr('data-'+name, countP);
			dispTextP.html(countP);
		}
	}else if (state == "edit"){
		console.log('state == "edit"')
		button.attr('data-state', "True");
		icon.toggleClass(fIcon);
	}else{
		console.log('state == "else"')
		count++;
		countP++;
		button.attr('data-state', "True");
		icon.toggleClass(fIcon);
		pin.attr('data-'+name, count);
		dispText.html(count);
		list.append('<li id="'+authUserO.id+'" class="display '+name+' item"><a href="/user/'+authUserO.id+'/">'+authUserO.username+'</a></li>')
		disp.show();
		console.log(disp)
		if (updateProfile){
			aProfile.attr('data-'+name, countP);
			dispTextP.html(countP);
		}
	}
	this.onSuccess = function(result, ajaxStutus, xhr) {
		console.log('------togglePinStatus onSuccess-------')
		console.log('result: ',result, 'xhr: ',xhr)
		
		//exicute callback with nameSucess
		var statusA = new Array(201, 204)
		var stat = xhr.status
		console.log('calling: ', xhr.status, name+'Success()')
		if (statusA.indexOf(stat)>=0 && typeof(window[name+'Success']) === "function"){
			window[name+'Success'](result, pin);
		}
	}
	console.log(url)
	if (typeof url == "string" && url != ""){
		//console.log('-ajax - 3 togglepin()');
		//ajax(messageTarget, reload, url, async, reqType, cbS, cbE, data)
		ajax(messageTarget, false, url, true, type, $.proxy(this.onSuccess, this), null, data)
		
		/* $.ajax({//3
			url: pinsPrefix+url,
			type: type,
			data: data,
			contentType: 'application/json',
			success: $.proxy(this.onSuccess, this),
			error: function(jqXHR, settings) {
				console.warn('togglePinStat() - ajax error');
			},
		}); */
	}
}

/**
 * Profile Functions.
 */
 //only use handlers in this view
 if (av != 'pins'){
	// add event listeners for profile buttons
	$('#user-pins').live('click', function(event){
		event.preventDefault();
		loadData(null, aProfileO.id);
	});
	$('#user-tags').live('click', function(event){
		event.preventDefault();
		loadData(vn.tags, aProfileO.id);
	});
	$('#user-favs').live('click', function(event){
		event.preventDefault();
		loadData(vn.favs, aProfileO.id);
	});
	$('#user-fing').live('click', function(event){
		event.preventDefault();
		if (aProfileO.id) {
			user = aProfileO.id
		}else{
			user = authUserO.id
		}
		loadData(vn.fing, user);
	});
	$('#user-cmnts').live('click', function(event){
		event.preventDefault();
		if (aProfileO.id) {
			user = aProfileO.id
		}else{
			user = authUserO.id
		}
		loadData(vn.cmnts, user);
	});
	$('#user-fers').live('click', function(event){
		event.preventDefault();
		if (aProfileO.id) {
			user = aProfileO.id
		}else{
			user = authUserO.id
		}
		loadData(vn.fers, user);
	});
	$('#follow').live('click', function(event){
		follow(this, 'followers');
	});
}
//welcome profile
$('#Recent-all').live('click', function(event){
	loadData(null, 'all');
	return false
});
$('#Popular-all').live('click', function(event){
	loadData(vn.pop, 'all');
	return false
});
$('#Category-all').live('click', function(event){
	loadData(vn.tags, 'all');
	return false
});

//toggle follow / unfollow
//TODO: see if it makes sence to refactor this into generic toggle
function follow(targetBtn, display) {
	var button = $(targetBtn);
	if (display){var name = display}else{
		var name = button.attr('id')
	}
	var state = button.attr('data-state');
	var pin = $($(targetBtn).closest(".pin"));
	var id = parseInt(pin.attr('id'));
	var count = pin.attr('data-'+name);
	var disp = pin.find('.display.'+name)
	var dispText = pin.find('.display.text.'+name)
	submitProgress(button);
	
	//TODO: ether add progress or move contents out of onFollow to speed it up
	this.onFollow = function( result ) {
		console.log('onFollow', result);
		// Update the number of followers displayed.
		console.log('count: '+count)
		console.log('state = '+state)
		if(state == "True") {
			button.attr('data-state', 'False');
			button.html('Follow')
			count--;
			console.log('count: '+count)
		} else {
			button.attr('data-state', 'True');
			button.html('Un-Follow')
			count++;
			console.log('count: '+count)
			//this.showLoader('Unliking');
		}
		pin.attr('data-'+name, count);
		dispText.html(count);
	};
	
	var url = pinsPrefix+'/toggle/auth/User/'+id+'/';
	console.log('-ajax - 4 follow()');
	$.ajax({//4
		url: url,
		type: 'POST',
		contentType: 'application/json',
		success: $.proxy(this.onFollow, this),//todo: need to detect if followed or not
		error: function(jqXHR, settings) {
			console.warn('follow - ajax error');
		},
	});
}

/**
 * Group view functions
 */
//add click handler for group image
$(document).on( 'click', '.pin.group .thumbs', function(event){
	target = $(event.target).closest('.pin.group')
	id = target[0].id
	loadData(id, aProfileO.id);
});


/**
 * Edit pin functions.
 */
$(document).ready(function() {
	//global vars
	prevUpload = false;
	thumbTarget = 'img#thumb_id'
	cUrl = $(thumbTarget).attr("src")
	console.log('document ready,  thumbTarget: '+thumbTarget+' / cUrl: '+cUrl)
	fileUploaders = replaceFileUpload('div#div_id_image');//*set fileFiled to disapy none on html then set to block after load
	console.log('fileUploaders = ')
	console.log(fileUploaders)
	//addClearToFileUploadBtn('.qq-upload-button');
	onFileChange();
	onUrlChange();
});
//detect image file changes
function onFileChange(thumb) {
	$('imput#id_uImage').change(function() {
		console.log('image changed - updating thumb');
		updateThumb(thumbTarget, this, 'input#id_imgUrl');
	});
}
//detect image url changes
function onUrlChange() {
	$('input#id_imgUrl').change(function() {
		console.log('url change detected');
		updateThumb(thumbTarget, this);
	});
}
//Replaced the specified target with the file-uploader element, Requires file-uplader.js
//- an element targeted by id(#) must be prefixed by an element
function replaceFileUpload(target){
	var i = 0
	var fileUploaders = []
	$(target).each(function() {
		var fileUploader = new qq.FileUploader( {
			action: "/ajax/thumb/",
			element: $(target)[i],
			multiple: false,
			allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],               
			sizeLimit: 0,   
			minSizeLimit: 0,
			template: '<div class="qq-uploader">' + 
                '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
                '<div class="qq-upload-button">Click to Browse or Drag Image Here</div>' +
                '<ul class="qq-upload-list"></ul>' + 
             '</div>',
			onError: function(id, fileName){
				//get error image
				$(thumbTarget).attr("src", '');
			},
			onSubmit: function(id, fileName){
				//remove previous item from list
				$('.qq-upload-list').children().remove()
				//get loading image
				$(thumbTarget).attr("src", STATIC_URL+'core/img/thumb-loader.gif');
			},
			onComplete: function( id, fileName, responseJSON ) {
				if( responseJSON.success ) {
					console.log('image uplaod success!');
					onFileChange();
					//store and delete previoius thumb
					prevUpload = $('input#id_uImage').val();
					console.log('prevUpload = '+prevUpload);
					if (prevUpload){
						uImageDelete(prevUpload);
					}
					//update uImage with tmpName for form and model
					$('input#id_uImage').attr("value", responseJSON.tmpName);
					//update variable with current uploaded file name for deletion
					uFileName = responseJSON.tmpName
					//update thumb
					updateThumb(thumbTarget, responseJSON, '#id_imgUrl');

				}else{
					console.warn('image uplaod failed :(')
				}
			},
			onAllComplete: function( uploads ) {
				// uploads is an array of maps
				// the maps look like this: { file: FileObject, response: JSONServerResponse }
				console.log('All uploads complete!: '+uploads)
				//re attach onFileChange due to html reset in file uplaoder
			},
			params: {
			  'csrf_token': $('input[name=csrfmiddlewaretoken]').val(),
			  'csrf_name': 'csrfmiddlewaretoken',
			  'csrf_xname': 'X-CSRFToken',
			},
		} ) ;
		//modify file uploader properties
		fileUploader._formatFileName = function(name){
			if (name.length > 15){
				name = name.slice(0, 15) + '...' + name.slice(-4);    
			}
			return name;
		}
		fileUploaders[i] = fileUploader;
		i++;
	});
	return fileUploaders
}

//(not used) wraps fileUpload field with clear button
var wrapTarget = false;
function addDeleteBtnToFileUpload(target){
	var file_input_index = 0;
    $(target).each(function() {
        file_input_index++;
		wrapId = $(this).attr('id')+'_wrap_'+file_input_index
		wrapTarget = "#"+wrapId
        $(this).wrap('<div id='+wrapId+'</div>');
        $(this).before('<input style="vertical-align: top; margin-right:2px; padding:1px 3px;" class="btn" type="button" value="X" onclick="reset_html(\'#'+wrapId+'\')" />');
		console.log('clear button added')
	});
}

//inputObj must be an HTML Object: use $()[0] to get HTML object form $() 
function updateThumb(thumbTarget, inputObj, clear) {
	console.log('-start updateThumb with object: '+inputObj);
	
	//remove thumb size
	$(thumbTarget).removeAttr('width');
	$(thumbTarget).removeAttr('height');
	
	if (inputObj.success){ 
		//update thumb for uImage change
		thumbUrl = inputObj.tmpUrl;
		$(thumbTarget).attr("src", thumbUrl)
		console.log('updated thumb with new uImage: '+thumbUrl)
	}else{
		//update thumb for url change 
		thumbUrl = inputObj.value;
		$(thumbTarget).attr("src", thumbUrl);
		console.log('updated thumb with new url: '+thumbUrl)
	}
	if (clear){
		console.log('start clear')
		//clear imgUrl or uImage when other is updated
		oldVal = $(clear).attr("value");
		$(clear).attr("value", null);
		newVal = $(clear).attr("value");
		console.log('end clear result: '+clear+' oldVal: '+oldVal+' newVal: '+newVal)
		console.log('-end updateThumb')
	}
	
}
//clear image upload field
function reset_html(clear) {
	console.log('reset html for: '+clear)
    $(clear).html($(clear).html());
	onFileChange()
	console.log('id_imgUrl.value: '+$('#id_imgUrl').attr("value"))
	if ($('#id_imgUrl').attr("value") == "") {
		$('#thumb_id').attr("src", cUrl);
		$('#id_imgUrl').attr("value", cUrl);
	}
}
//Delete uploaded image
function uImageDelete(fileName) {
	var jqxhr = $.post('/ajax/thumb/'+fileName, function() {
      console.log('ajax del success: '+fileName);
    })
    .success(function() { console.log('ajax del success2'); })
    .error(function() { console.warn('ajax del error'); })
    .complete(function() { console.log('ajax del complete'); });
}
//Cancel new pin
function cancelNewPin(){			
	if (prevUpload){
		uImageDelete(prevUpload);
	}
	prevUpload = false;
	//remove previous item from list
	$('.qq-upload-list').children().remove()
	//get default image
	$(thumbTarget).attr("src", STATIC_URL+'core/img/thumb-default.png');
}


/** 
 * UTILITIES
 */
 
/* TOGGLE TOUCH HOVER ELEMENT by touching another element for touch devices
*- target is the element you want to show on touch & hover
*- use $(document).on('MSPointerUp touchend', '.class', function(e){get target here} 
*- the required css is: .class:hover.touch-off .taget,.class.touch-on .target.touch-hover{ hover state style }
*/
function toggleTouchHover(target, self){
	if(self===undefined){self = true}
	//console.log(target)
	if(!aTouchHover){
		target.toggleClass('touch-hover');
		aTouchHover = target;
	}else if(aTouchHover && aTouchHover[0] == target[0] && self){
		aTouchHover.toggleClass('touch-hover')
		aTouchHover = undefined;
	}else if(aTouchHover != undefined && aTouchHover[0] != target[0]){
		target.toggleClass('touch-hover');
		aTouchHover.toggleClass('touch-hover')
		aTouchHover = target;
	}
}
function toggleHover(target, self){
	if(self===undefined){self = true}
	if(!aTouchHover){
		target.addClass('touch-hover');
		aTouchHover = target;
	}else if(aTouchHover && aTouchHover[0] == target[0] && self){

	}else if(aTouchHover != undefined && aTouchHover[0] != target[0]){
		target.addClass('touch-hover');
		aTouchHover.removeClass('touch-hover')
		aTouchHover = target;
	}
}
//reset all froms on page
function resetForms(){
	console.warn('****resetForms()')
	forms = $('form')
	for (form in forms.length){
		try{
			forms[form].reset();
		}catch(err){}
	}
}
//checks if value is in an array return false or value
function inArray(value, array){
	var i;
	for (i=0; i < array.length; i++) {
		if (array[i] === value) {
			return value;
		}
	}
	return false;
};
//check for if key exists for given value in array, return false or key
function getKey(value, array){
	for (key in array) {
		if (array[key] === value) {
			return key;
		}
	}
	return false;
};
//check for if value exists for given key in array, return false or value
function getValue(key, array){
	for (i in array) {
		if (array[key]) {
			return array[key];
		}
	}
	return false;
};
//get host name from url
function getHost(url){
	var a = document.createElement('a');
	a.href = url;
	p = a.hostname.split("www.")
	if (p[1]===undefined){h=p[0]}else{h=p[1]};
	return h
}
//get sive of current window
function getWindowSize() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
  return {width:myWidth, height:myHeight}
}
// url / display safe
function idSafe(s){
	s = s.replace(/\s/g, '-')
	s = s.replace(/&/g, 'ands')
	return s
}
function displaySafe(s){
	s = s.replace(/%20/g, ' ')
	s = s.replace(/%26/g, '&')
	return s
}
function urlSafe(s){
	s = s.replace(/&/g, '%26')
	return s
}
//kill events (unused)
var k = function(e){
	e.preventDefault();
	e.stopPropagation();
	
	return false;
 }
function kill(type){
 console.log('kill',type)
 window.document.body.addEventListener(type, k, true);
}
function unkill(type){
 console.warn('unkill', type)
 window.document.body.removeEventListener(type, k, true);
}
//jquery function to format form data as assoc.array
(function($){
// Use internal $.serializeArray to get list of form elements which is
// consistent with $.serialize
//
// From version 2.0.0, $.serializeObject will stop converting [name] values
// to camelCase format. This is *consistent* with other serialize methods:
//
//   - $.serialize
//   - $.serializeArray
//
// If you require camel casing, you can either download version 1.0.4 or map
// them yourself.
//
$.fn.serializeObject = function () {
	"use strict";

	var result = {};
	var extend = function (i, element) {
		var node = result[element.name];

// If node with same name exists already, need to convert it to an array as it
// is a multi-value field (i.e., checkboxes)

		if ('undefined' !== typeof node && node !== null) {
			if ($.isArray(node)) {
				node.push(element.value);
			} else {
				result[element.name] = [node, element.value];
			}
		} else {
			result[element.name] = element.value;
		}
	};

// For each serialzable element, convert element names to camelCasing and
// extend each of them to a JSON object

	$.each(this.serializeArray(), extend);
	return result;
};
})(jQuery);

