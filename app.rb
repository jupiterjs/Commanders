require "sinatra"
require "mongo"
require "json"

get "/" do
	File.read(File.join("public", "index.html"))
end

before "/api/*" do
	content_type :json

	connection = Mongo::Connection.new("flame.mongohq.com", 27107)
	db = connection.db("app6026407")
	db.authenticate("heroku", "566e048b9d94bcd99d250ff51259eb74")

	@commanders = db.collection("commanders")
end

def replaceProp(hash, origProp, newProp)
	hash[newProp] = hash[origProp].to_s
	hash.delete(origProp)
end

get "/api/commanders" do
	commanders = @commanders.find().to_a
	commanders.each do |c|
		c["votes"] = c["upvotes"].to_i - c["downvotes"].to_i
		replaceProp(c, "_id", "id")
	end

	commanders.sort! { |a,b| b["votes"] <=> a["votes"] }
	commanders.to_json
end

get "/api/commanders/:id" do
	commander = @commanders.find_one(:_id => BSON::ObjectId(params[:id]))

	if commander.count > 0
		replaceProp(commander, "_id", "id")
	end

	commander.to_json
end

post "/api/commanders" do
	body = JSON.parse(request.body.read)
	id = @commanders.insert(body).to_s

	replaceProp(body, "_id", "id")
	body.to_json
end

put "/api/commanders/:id" do
	id = BSON::ObjectId(params[:id])
	p = params

	commander = @commanders.find_one(:_id => id)

	if p["like"]
		commander["upvotes"] = commander["upvotes"].to_i + 1
	else
		commander["downvotes"] = commander["downvotes"].to_i + 1
	end

	@commanders.update({ :_id => id }, commander);

	replaceProp(commander, "_id", "id")
	commander.to_json
end

delete "/api/commanders/:id" do
	#@commanders.remove(:_id => BSON::ObjectId(params[:id]))
end