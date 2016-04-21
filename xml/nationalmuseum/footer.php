<?php

/**

 * The template for displaying the footer.

 *

 * Contains the closing of the #content div and all content after

 *

 * @package Kosningaréttur kvenna 100 ára

 */

?>







	<footer id="colophon" class="site-footer" role="contentinfo">

		<div class="site-content">

			

			<div class="row">

				

				<div class="col">

					<?php dynamic_sidebar( 'footer-left' ); ?>

					

				</div>



				<div class="col">					

					<?php dynamic_sidebar( 'footer-right' ); ?>

				</div>



				<div class="clearfix"></div>

				

			</div>



		</div>



	</footer><!-- #colophon -->

</div><!-- #page -->



<div id="overlay-container"></div>



<script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/lib/jquery.min.js"></script>

<?php wp_footer(); ?>



<script>

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){

  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),

  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)

  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-19666866-27', 'auto');

  ga('send', 'pageview');

</script>

</body>

</html>

