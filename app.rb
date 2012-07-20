require "sinatra"
require "mongo"
require "json"

get "/" do
	File.read(File.join("public", "index.html"))
end

before do
	content_type :json

	connection = Mongo::Connection.new("flame.mongohq.com", 27107)
	db = connection.db("app6026407")
	db.authenticate("heroku", "566e048b9d94bcd99d250ff51259eb74")

	@commanders = db.collection("commanders")
end

get "/api/commanders" do
	commanders = @commanders.find().to_a
	commanders.each { |c| c["_id"] = c["_id"].to_s }

	commanders.to_json
end

get "/api/commanders/:id" do
	commander = @commanders.find_one(:_id => BSON::ObjectId(params[:id]))

	if commander.count > 0
		commander["_id"] = commander["_id"].to_s
	end

	commander.to_json
end

post "/api/commanders" do
	body = JSON.parse(request.body.read)
	id = @commanders.insert(body).to_s

	body.merge({ "_id" => id }).to_json
end

put "/api/commanders/:id" do
	id = BSON::ObjectId(params[:id])

	commander = @commanders.find_one(:_id => id)
	commander.merge!(JSON.parse(request.body.read))

	@commanders.update({ :_id => id }, commander);

	commander["_id"] = commander["_id"].to_s
	commander.to_json
end

delete "/api/commanders/:id" do
	@commanders.remove(:_id => BSON::ObjectId(params[:id]))
end