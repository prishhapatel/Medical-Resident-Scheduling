# Use the official .NET 6 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /app

# Copy project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET 6 runtime image for running
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app

# Copy the published app from the build stage
COPY --from=build /app/out .

# Expose the port that Coolify expects
EXPOSE 3000

# Set environment variable for ASP.NET Core to listen on all interfaces
ENV ASPNETCORE_URLS=http://0.0.0.0:3000

# Start the application
ENTRYPOINT ["dotnet", "MedicalDemo.dll"]
