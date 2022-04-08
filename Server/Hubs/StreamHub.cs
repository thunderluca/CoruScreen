using Microsoft.AspNetCore.SignalR;

namespace CoruScreen.Server.Hubs
{
    public class StreamHub : Hub
    {
        private readonly ILogger<StreamHub> _logger;

        public StreamHub(ILoggerFactory loggerFactory)
        {
            ArgumentNullException.ThrowIfNull(loggerFactory, nameof(loggerFactory));

            _logger = loggerFactory.CreateLogger<StreamHub>();
        }

        public async Task Create(string id)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, id);

            _logger.LogInformation($"Stream group with id {id} created");
        }

        public async Task EndStream(string id)
        {
            await Clients.GroupExcept(id, Context.ConnectionId).SendAsync("streamEnded");

            _logger.LogInformation($"Stream end notified to group with id {id}");
        }

        public async Task Join(string id)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, id);

            await Clients.GroupExcept(id, Context.ConnectionId).SendAsync("userJoined", Context.ConnectionId);

            _logger.LogInformation($"User with id {Context.ConnectionId} added to stream group {id}");
        }

        public async Task Leave(string id)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, id);

            await Clients.GroupExcept(id, Context.ConnectionId).SendAsync("userLeaved", Context.ConnectionId);

            _logger.LogInformation($"User with id {Context.ConnectionId} leaved stream group {id}");
        }

        public async Task SendSignal(string clientId, string signal)
        {
            if (string.IsNullOrWhiteSpace(clientId) || Clients.Client(clientId) is null)
            {
                _logger.LogError("Received signal with null, empty or blank client id");
                return;
            }

            var client = Clients.Client(clientId);
            if (client is null)
            {
                _logger.LogError($"Client with id {clientId} not found");
                return;
            }

            await client.SendAsync("signalReceived", Context.ConnectionId, signal);

            _logger.LogInformation($"Signal sent from {Context.ConnectionId} to {clientId}");
        }
    }
}