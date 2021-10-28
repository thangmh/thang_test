let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index");
chai.should();

chai.use(chaiHttp);

describe("Tasks API", () => {
  /**
   * Test the GET route
   */
  describe("GET api/getbooking", () => {
    it("It should GET all the booking", (done) => {
      chai
        .request(server)
        .get("api/getbooking")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          done();
        });
    });
    it("It should not GET all the booking", (done) => {
      chai
        .request(server)
        .get("api/getbookings")
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  /**
   * Test the GET ( by id ) route
   */
  describe("GET api/find", () => {
    it("It should GET booking by id", (done) => {
      const id = 1;
      chai
        .request(server)
        .get("api/find/" + id)
        .end((err, response) => {
          response.should.have.status(200);
          response.should.have.be.a("object");
          response.should.have.property("id");
          response.should.have.property("booking_type_id");
          response.should.have.property("time_start");
          response.should.have.property("user_id");
          response.should.have.property("time_type");
          response.should.have.property("hour_time");
          response.should.have.property("deleted_date");
          response.should.have.property("id").eq(1);
          done();
        });
    });
    it("It should not GET booking by id", (done) => {
      const id = 1222;
      chai
        .request(server)
        .get("api/find/" + id)
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  /**
   * Test the POST route
   */
  describe("POST api/booking", () => {
    it("It should POST a new booking", (done) => {
      const booking = {
        booking_type_id: 1,
        user_id: 5,
        time_start: "2020-10-28 04:15:02",
        time_type: 2,
        hour_time: 0,
      };
      chai
        .request(server)
        .post("api/booking")
        .send(booking)
        .end((err, response) => {
          response.should.have.status(201);
          response.should.have.be.a("object");
          response.should.have.property("booking_type_id").eq(1);
          response.should.have.property("time_start").eq();
          response.should.have.property("user_id").eq(5);
          response.should.have.property("time_type").eq(2);
          response.should.have.property("hour_time").eq(0);
          done();
        });
    });
    it("It should not GET booking by id", (done) => {
      const booking = {
        booking_type_id: 1,
        user_id: 5,
        time_start: "2020-10-28 06:15:02",
        time_type: 2,
        hour_time: 0,
      };
      chai
        .request(server)
        .post("api/booking")
        .send(booking)
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
  /**
   * Test the PUT route
   */

  /**
   * Test the DELETE route
   */

   describe("DELETE api/delete", () => {
    it("It should Delete a booking", (done) => {
      const bookingId = 1;
      chai
        .request(server)
        .delete("api/delete/" + bookingId)
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });
    it("It should Delete a booking", (done) => {
        const bookingId = 1125;
        chai
          .request(server)
          .delete("api/delete/" + bookingId)
          .end((err, response) => {
            response.should.have.status(400);
            done();
          });
      });
  });
});
