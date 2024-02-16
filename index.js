const express = require('express');
const fs = require('fs');
const users = require("./MOCK_DATA.json");

const app = express();
const PORT = 8000;

// Middleware - Plugin
app.use(express.urlencoded({ extended: false }));


//API CODES...(Without Dynamic Routes)
// (A) REST API - SEND HTML
app.get('/users', (req, res) => {
    const html = `
    <ul>
        ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>
    `;
        res.send(html);
    });

// (B) REST API - JSON all with out id
// app.get("/api/users", (req, res) => {
//     return res.json(users);
// });


//API CODES...(With Dynamic Route)
// Routes => /api/users/:id
app.route("/api/users/:id")

    .get((req, res) => {
        // Extract the user ID from the request parameters
        const id = req.params.id;

        // Check if the user ID contains a space
        if (id.includes(' ')) {
            // Return information of all users
            return res.json(users);
        } else {
            // Parse the user ID to a number and find the specific user
            const numericId = Number(id);
            const user = users.find(user => user.id === numericId);

            // Check if the user with the specified ID was found
            if (user !== undefined) {
                // Return information of the specific user
                return res.json(user);
            } else {
                // Return a 404 status if the user was not found
                return res.status(404).json({ error: 'User not found' });
            }
        }
    })

    .patch((req, res) => {
        const id = Number(req.params.id);
        const userIndex = users.findIndex(user => user.id === id);

        if (userIndex !== -1) {
            // Update user with new data from request body
            users[userIndex] = { ...users[userIndex], ...req.body };

            // Write updated data back to file
            fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
                if (err) {
                    console.error(`Error writing to file: ${err.message}`);
                    return res.status(500).json({ status: "Error writing to file" });
                }
                return res.json({ status: "User Updated Successfully", user: users[userIndex] });
            });
        } else {
            // If user is not found, return a 404 status and a JSON response
            return res.status(404).json({ status: "User not found" });
        }
    })

    .delete((req, res) => {
        // Get id parameter in request
        const id = Number(req.params.id);
        
        // Find user in DB
        const userIndex = users.findIndex(user => user.id === id);
    
        // If user is found in DB
        if (userIndex !== -1) {
            // Delete user from DB
            users.splice(userIndex, 1);
    
            // Write updated data back to file
            fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
                if (err) {
                    console.error(`Error writing to file: ${err.message}`);
                    return res.status(500).json({ status: "Error writing to file" });
                }
                return res.json({ status: "User Deleted Successfully" });
            });
        } else {
            // If user is not found, return a 404 status and a JSON response
            return res.status(404).json({ status: "User not found" });
        }
    });



// Routes => /api/users
app.route("/api/users")
    .post((req, res) => {
        const body = req.body;
        users.push({...body, id:users.length + 1});
        fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
            return res.json({status: "Sucess", id: users.length });
        });
    });





app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
}).on('error', (err) => {
    console.error(`Error starting server: ${err.message}`);
});
