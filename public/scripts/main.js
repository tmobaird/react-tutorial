//REACTION CLASS
var Reaction = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  render: function() {
    return (
      <div>
        <h5 className="reactionAuthor">{this.props.author}</h5>
        <p>{this.props.children}</p>
      </div>
    );
  }
});




//REACTIONLIST CLASS
var ReactionList = React.createClass({
  getInitialState: function() {
    return (<h4>No REACTions yet!</h4>);
  },
  render: function() {
    return (
      <div>
        {this.props.data.length > 0 ? <h4>REACTions</h4> : null}
        {this.props.data.map((reaction, reactionIndex) =>
          <div className="row"> 
              <div className="panel panel-default">
                <div className="col-md-10">
                  <Reaction author={reaction.author}>{reaction.text}</Reaction>
                </div>
                <div className="delete-button btn-group comment col-md-2">
                  <button className="btn btn-sm btn-danger" onClick={this.handleDelete} value={reactionIndex}> Delete </button>
                </div>
              </div>
          </div>
        )}
      </div>
    );
  }
});



//COMMENT CLASS
var Comment = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
	render: function() {
		return (
			<div className="comment">
					<h4 className="commentAuthor">{this.props.author}</h4>
          <p>{this.props.children}</p>
			</div>
		);
	}
});




//COMMENT LIST CLASS
var CommentList = React.createClass({
	getInitialState: function() {
    return (<h4>No comments yet!</h4>);
  },
  handleDelete: function(e) {
    this.props.deleteComment(e);
  },
  handleLike: function(e) {
    this.props.likeComment(e);
  },
  handleDislike: function(e) {
    this.props.dislikeComment(e);
  },
	render: function() {
    return (
    	<div>
        {this.props.data.map((comment, commentIndex) =>
          <div className="row"> 
            <div className="row comment" id="comment-row">
            <div className="comment col-md-1">
            </div>
            	<div className="comment col-md-8">
                <Comment author={comment.author} key={comment.key} reactions={comment.reactions}>{comment.text}</Comment>
                <small>
                  <button className="btn btn-info btn-sm glyphicon glyphicon-thumbs-up" onClick={this.handleLike} value={commentIndex}>
                  </button> {comment.likes} Likes 
                  <button className="btn btn-info btn-sm glyphicon glyphicon-thumbs-down" onClick={this.handleDislike} value={commentIndex}>
                  </button> {comment.dislikes} Dislikes
                </small>
              </div>
              <div className="delete-button btn-group comment col-md-3">
                <button className="btn btn-secondary btn-success" onClick={this.handleDelete} value={commentIndex}> Edit </button>
                <button className="btn btn-secondary btn-danger" onClick={this.handleDelete} value={commentIndex}> Delete </button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-2">
              </div>
              <div className="col-md-5">
                <ReactionList data={comment.reactions} />
              </div>
              <div className="col-md-5">
              </div>
            </div>
          </div>
        )}
    	</div>
    );			
	}
});




//COMMENT FORM CLASS
var CommentForm =  React.createClass({
	getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text, likes: 0, dislikes: 0});
    this.setState({author: '', text: '', likes: 0, dislikes: 0});
  },
	render: function() {
		return (
    <div className="col-md-4">
			<form className="commentForm" onSubmit={this.handleSubmit}>
        <input
        	className="form-control"
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <input
        	className="form-control"
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
        />
		    <input className="btn btn-large btn-primary" type="submit" value="Post" />
		  </form>
    </div>
		);
	}
});



//COMMENT BOX CLASS
var CommentBox = React.createClass({
	loadCommentsFromServer: function() {
	    $.ajax({
	      url: this.props.url,
	      dataType: 'json',
	      cache: false,
	      success: function(data) {
	        this.setState({data: data});
	      }.bind(this),
	      error: function(xhr, status, err) {
	        console.error(this.props.url, status, err.toString());
	      }.bind(this)
	    });
	},
	handleCommentSubmit: function(comment) {
		var comments = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
      	this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  deleteComment: function(comment) {
  	var comments = this.state.data;
  	var commentIndex = parseInt(comment.target.value, 10);
  	var commentToDelete = this.state.data[commentIndex];
  	console.log('remove task: %d', commentIndex, commentToDelete);
  	this.setState(state => { 
  		state.data.splice(commentIndex, 1);
  		return {data: state.data}
  	});
  	$.ajax({
      url: this.props.url + "?_=" + commentIndex,
      type: 'DELETE',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
      	this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  likeComment: function(comment) {
    var comments = this.state.data;
    var commentIndex = parseInt(comment.target.value, 10);
    var commentToLike = this.state.data[commentIndex];
    commentToLike["likes"]++
    console.log(commentIndex);
    console.log('liking comment: %d', commentIndex, commentToLike);
    var initial = parseInt(this.state.data[commentIndex]["likes"], 10);
    this.setState(state => { 
      state.data[commentIndex]["likes"] = initial + 1;
      return {data: state.data}
    });
    $.ajax({
      url: this.props.url + "?_=" + commentIndex,
      dataType: 'json',
      type: 'PUT',
      data: this.state.data[commentIndex],
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  dislikeComment: function(comment) {
    var commentIndex = parseInt(comment.target.value, 10);
    var commentToDislike = this.state.data[commentIndex];
    commentToDislike["dislikes"]++
    console.log(commentIndex);
    console.log('disliking comment: %d', commentIndex, commentToDislike);
    var initial = parseInt(this.state.data[commentIndex]["dislikes"], 10);
    this.setState(state => { 
      state.data[commentIndex]["dislikes"] = initial + 1;
      return {data: state.data}
    });
    $.ajax({
      url: this.props.url + "?_=" + commentIndex,
      dataType: 'json',
      type: 'PUT',
      data: this.state.data[commentIndex],
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
	getInitialState: function() {
    	return {data: []};
  	},
  	componentDidMount: function() {
	    this.loadCommentsFromServer();
    	setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	render: function() {
		return (
			<div className="commentBox">
				<h1>Comments 🐳</h1>
				<div className="row commentList"><CommentList data={this.state.data} deleteComment={this.deleteComment} likeComment={this.likeComment} dislikeComment={this.dislikeComment} /></div>
        <div className="row commentForm">
					<h2>Add a Comment!</h2>
					<CommentForm onCommentSubmit={this.handleCommentSubmit} />
				</div>
			</div>
		);
	}
});

ReactDOM.render(<CommentBox url="/api/comments" pollInterval={2000} />, document.getElementById('content'));