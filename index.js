exports.lambdaHandler = async (event) => {
  if (event.queryStringParameters) {
    // Register Webhook
    const queryParams = event.queryStringParameters;
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = queryParams["hub.mode"];
    let token = queryParams["hub.verify_token"];
    let challenge = queryParams["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        console.log("WEBHOOK_VERIFIED");
        return {
          statusCode: 200,
          body: challenge,
        };
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        return {
          statusCode: 403,
        };
      }
    }
  } else {
    const token = process.env.WHATSAPP_TOKEN;
    const body = event;
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id =
          body.entry[0].changes[0].value.metadata.phone_number_id;
        // Extract the phone number from the webhook payload
        let from = body.entry[0].changes[0].value.messages[0].from; 
        // Define a message
        const defaultmessage = "TYPE THE MESSAGE HERE";
        await fetch(`https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`, {
          headers: { "Content-Type": "application/json" },
          method: 'POST',
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: { body: defaultmessage }
          })
        });
        return {
          statusCode: 200,
        };
      }
    }
  }
};