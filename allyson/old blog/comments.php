<html>
	<head>
		<title>Comments</title>
		<link rel="shortcut icon" href="/Ally/images/favaicon.png" />
		<link href="/Ally/css/styles2.css" type="text/css"
			rel="stylesheet" />
	</head>
	<body>
		<h1>Chez Allyson</h1>
		<hr />
		<nav>
			<ul>
				<li><a href="/Ally">Home</a></li>
				<li><a href="/Ally/aboutme">About Me</a></li>
				<li><a href="/Ally/blog">My Blog</a></li>
				<li><a href="/Ally/contact">Contact</a></li>
			</ul>
		</nav>
		<h2>Comments</h2>
		<p class="comments"><strong>Name:</strong> <?php echo $_POST["name"]; ?> <br>
		<strong>Comment:</strong> <?php echo $_POST["comments"]; ?></p>
	</body>
</html>