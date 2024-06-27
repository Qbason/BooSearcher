import subprocess

print("Setting up kubernetes connection...")
serverUrl = input(f"Enter server url: ")
agentId = input("Enter agent id: ")
token = input("Enter token:")
while(not token):
    token = input("Enter valid token:")
contextName = input("Enter context name:")
userName = input("Enter user name:")
while(not userName):
    userName = input("Enter valid user name:")
clusterName = input("Enter cluster name:")

commands = [(f"kubectl config set-cluster {clusterName} --server \"{serverUrl}\""),
(f"kubectl config set-credentials {userName} --token \"pat:{agentId}:{token}\""),
(f"kubectl config set-context {contextName} --cluster {clusterName} --user {userName}"),
(f"kubectl config use-context {contextName}"),
(f"kubectl get nodes")]

print("Commands to be executed:")
for command in commands:
    print(command)


process = subprocess.Popen(["bash"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
if(not process.stdin):
    print("Failed to start bash process.")
    exit(1)

for command in commands:
    process.stdin.write(command.encode())
    process.stdin.write(b"\n")
    process.stdin.flush()
    
output, error = process.communicate()
if output:
    print("Output: ", output.decode())
if error:
    print("Error: ", error.decode())

process.wait()
process.stdin.close()
print("Kubernetes connection setup completed.")


