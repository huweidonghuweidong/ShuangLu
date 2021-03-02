// JavaScript Document
var slider = new Object();
slider.current = 1;
slider.total = 5;
slider.delay = 5;

slider.InitSlide = function() {
	this.current = 1;
	//Init for pictures
	$(".slide_pic").each(function(i, it) {
		//set z-index
		//$(it).css("position", "absolute");
		$(it).css("z-index", i + 1);
		//set hidden for the second picture to the last one
		if(i > 0) {
			$(it).css("display", "none");
		}
		
		$(it).mouseover(function () {
			$(".slide_comment_title").text($(this).children("img").attr("alt"));
			$(".slide_comment_content").text($(this).children("img").attr("comment"));
			$(".slide_comment").fadeIn();
		});
		$("#slide_container").mouseleave(function () {
			$(".slide_comment").fadeOut();
		});
	
	});
	
	//Init for button
	$(".slide_nav_btn").each(function(i, it) {
		$(it).click(function() {
			slider.current = i + 1;
			
			$(".slide_nav_btn").removeClass("active").removeClass("unactive").addClass("unactive");
			$(it).removeClass("unactive").addClass("active");
			
			var whichslide = $(it).attr("rel");
			$(".slide_pic").each(function(z, zt) {
				if(whichslide == ("#" + $(zt).attr("id"))) {
					//$(zt).css("display", "block");
					$(zt).fadeIn(3000);
					$(".slide_comment_title").text($(zt).children("img").attr("alt"));
					$(".slide_comment_content").text($(zt).children("img").attr("comment"));
				}
				else {
					$(zt).css("display", "none");
				}
			});
		});
	});
}

slider.AutoPlay = function() {
	$(".slide_pic").each(function(i, it) {
		if ((i + 1) == slider.current) {
			$("#slide-" + (i + 1)).fadeIn(3000);
			$(".slide_comment_title").text($(it).children("img").attr("alt"));
			$(".slide_comment_content").text($(it).children("img").attr("comment"));
		}
		else {
			$(it).css("display", "none");
		}
	});
	
	$(".slide_nav_btn").removeClass("active").removeClass("unactive");
	$(".slide_nav_btn").each(function(i, it) {
		if((i + 1) == slider.current) {
			$(it).addClass("active");
		}
		else {
			$(it).addClass("unactive");
		}
	});
	
	if(slider.current == slider.total) {
		slider.current = 1;
	}
	else {
		slider.current += 1;
	}
}
//========================================
window.setInterval("slider.AutoPlay()", slider.delay * 1000);

$(document).ready(function() {
	slider.InitSlide();
	slider.AutoPlay();
});
