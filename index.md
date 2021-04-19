---
layout: default
author: Kike Fontán
title: Archive
subtitle: Kike Fontán
sitemap:
  priority: 0.9
---
<!-- Description -->
<div id="describe-text">
	<p>My little time machine</p>
</div>

<br>

<!-- Links -->
<div>
	{% assign postsCategory = site.posts | group_by_exp:"post", "post.categories" %}
	{% for category in postsCategory %}
			<!-- Category -->
			<h4 class="post-teaser__month">
				<strong>- - - - - {{ category.name }} - - - - -</strong>
			</h4>
			<!-- Posts -->
			<ul class="list-posts">
				{% for post in category.items %}
					<li class="post-teaser">
						<a href="{% if post.layout == "media" %}{{ post.link | prepend: "/assets/media/" | prepend: site.baseurl }}{% else %}{{ post.link }}{% endif %}"><span class="post-teaser__title">{{ post.title }}</span></a>
						<a href="{% if post.archive %}{{ post.archive }}{% else %}{{ post.link }}{% endif %}"><span class="post-teaser__date">{{ post.date | date: "%d %B %Y" }}{% if post.archive %} - Archived{% endif %}</span></a>
					</li>
				{% endfor %}
			</ul>
	{% endfor %}
</div>