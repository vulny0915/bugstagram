const Post = require("../models/post.model");
const request = require('request')

exports.allPost = (req, res) => {
	Post.find()
		.populate("PostedBy", "_id Name")
		.populate("Comments.PostedBy", "_id Name")
		.sort("-createdAt")
		.then((data) => {
			let posts = [];
			data.map((item) => {
				posts.push({
					_id: item._id,
					Title: item.Title,
					Body: item.Body,
					PostedBy: item.PostedBy,
					Photo: item.Photo.toString("base64"),
					PhotoType: item.PhotoType,
					Likes: item.Likes,
					Comments: item.Comments,
				});
			});
			res.json({ posts });
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.subPost = (req, res) => {
	Post.find({ PostedBy: { $in: req.user.Following } })
		.populate("PostedBy", "_id Name")
		.populate("Comments.PostedBy", "_id Name")
		.sort("-createdAt")
		.then((data) => {
			let posts = [];
			data.map((item) => {
				posts.push({
					_id: item._id,
					Title: item.Title,
					Body: item.Body,
					PostedBy: item.PostedBy,
					Photo: item.Photo.toString("base64"),
					PhotoType: item.PhotoType,
					Likes: item.Likes,
					Comments: item.Comments,
				});
			});
			res.json({ posts });
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.myPost = (req, res) => {
	Post.find({ PostedBy: req.user._id })
		.populate("PostedBy", "_id Name")
		.populate("Comments.PostedBy", "_id Name")
		.sort("-createdAt")
		.then((data) => {
			let posts = [];
			data.map((item) => {
				posts.push({
					id: item._id,
					title: item.Title,
					body: item.body,
					//postedBy: item.PostedBy,
					photo: item.Photo.toString("base64"),
					photoType: item.PhotoType,
					likes: item.Likes,
					Comments: item.Comments,
				});
			});
			res.json({ posts });
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.createPost = (req, res) => {
	var { title, body, photoEncode, photoType, url } = req.body;
	if (!title || !body || (!photoEncode && !url)) {
		return res.json({
			error: "Please submit all the required fields.",
		});
	}
	const post = new Post({
		Title: title,
		Body: body,
		PostedBy: req.user,
	});

	if(url){
		request.get({followAllRedirects: true, url: url, encoding: null}, function(error, response, body){
			console.log(error)
			console.log(response)
			console.log(body)
			post.Photo = body
			post.PhotoType = photoType;
			console.log(photoEncode)
			post.save()
			.then((result) => {
				res.json({ message: "Post created successfully" });
			})
			.catch((err) => {
				console.log(err);
			});
		})
	}
	else{
		if (photoEncode != null) {
			console.log(123)
			post.Photo = new Buffer.from(photoEncode, "base64");
			console.log(post.Photo)
			post.PhotoType = photoType;
		}
		post.save()
		.then((result) => {
			res.json({ message: "Post created successfully" });
		})
		.catch((err) => {
			console.log(err);
		});
	}


};

exports.like = (req, res) => {
	Post.findByIdAndUpdate(
		req.body.postId,
		{
			$push: { Likes: req.user._id },
		},
		{ new: true }
	)
		.populate("PostedBy", "_id Name")
		.populate("Comments.PostedBy", "_id Name")
		.exec((err, result) => {
			if (err) return res.status(422).json({ Error: err });
			else {
				res.json({
					_id: result._id,
					Title: result.Title,
					Body: result.Body,
					PostedBy: result.PostedBy,
					Photo: result.Photo.toString("base64"),
					PhotoType: result.PhotoType,
					Likes: result.Likes,
					Comments: result.Comments,
				});
			}
		});
};

exports.unlike = (req, res) => {
	Post.findByIdAndUpdate(
		req.body.postId,
		{
			$pull: { Likes: req.user._id },
		},
		{ new: true }
	)
		.populate("PostedBy", "_id Name")
		.populate("Comments.PostedBy", "_id Name")
		.exec((err, result) => {
			if (err) return res.status(422).json({ Error: err });
			else {
				console.log(result);
				res.json({
					_id: result._id,
					Title: result.Title,
					Body: result.Body,
					PostedBy: result.PostedBy,
					Photo: result.Photo.toString("base64"),
					PhotoType: result.PhotoType,
					Likes: result.Likes,
					Comments: result.Comments,
				});
			}
		});
};

exports.comment = (req, res) => {
	const comment = { Text: req.body.text, PostedBy: req.user._id };
	Post.findByIdAndUpdate(
		req.body.postId,
		{
			$push: { Comments: comment },
		},
		{ new: true }
	)
		.populate("Comments.PostedBy", "_id Name")
		.populate("PostedBy", "_id Name")
		.exec((err, result) => {
			if (err) return res.status(422).json({ Error: err });
			else {
				res.json({
					_id: result._id,
					Title: result.Title,
					Body: result.Body,
					PostedBy: result.PostedBy,
					Photo: result.Photo.toString("base64"),
					PhotoType: result.PhotoType,
					Likes: result.Likes,
					Comments: result.Comments,
				});
			}
		});
};

exports.deletePost = (req, res) => {
	Post.findOne({ _id: req.params.postId })
		.populate("PostedBy", "_id")
		.exec((err, post) => {
			if (err || !post) return res.status(422).json({ Error: err });
			post.remove()
				.then((result) => {
					res.json(result._id);
				})
				.catch((err) => console.log(err));
		});
};
