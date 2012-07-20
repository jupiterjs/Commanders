require "sinatra"

# Static routes

get "/" do
	File.read(File.join("public", "index.html"))
end

get "/api/commanders" do
end

get "/api/commanders/:id" do
end

post "/api/commanders" do
end

put "/api/commanders/:id" do
end

delete "/api/commanders/:id" do
end