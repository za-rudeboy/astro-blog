---
title: "Containing AI Agents with Virtual Machines and NAT Networking"
description: "Running AI Agents Safely with a Local VM (and QEMU Port Forwarding)"
date: "Mar 09 2026"
---

#### Running Risky AI Agents Safely: Using a VM and QEMU Port Forwarding

I recently wanted to experiment with **OpenClaw**, an autonomous coding
agent. These types of tools are powerful, but they come with a
significant security caveat:

They typically require **full shell access** to the machine they run on.

That means the agent can:

-   read files
-   execute arbitrary commands
-   install packages
-   modify system configuration

On a personal laptop where you do things like **banking, SSH into
servers, or store credentials**, giving an LLM that level of access is
risky.

Two reasons in particular:

1.  **LLMs are not deterministic** -- they can make unexpected
    decisions.
2.  **They can be exploited** -- prompt injection or malicious code
    could potentially make the agent execute harmful commands.

Because of this, the safest approach is to run the agent in an
isolated environment.

------------------------------------------------------------------------

#### Why I Used a Virtual Machine

The ideal setup would be a **separate physical machine or VPS**, but I
didn't want to spend money just to experiment.

Instead I created a virtual machine on my Fedora laptop using
KVM/QEMU.

This gave me:

-   isolation from my host system
-   the ability to wipe and rebuild easily
-   full root access inside the VM without risking my laptop

------------------------------------------------------------------------

#### Hardening the VM Network

Networking is an important part of isolation.

There are two common options when running a VM.

###### Bridged Networking

The VM becomes a **full member of your local network**.

Example:

    Laptop: 192.168.1.10
    VM:     192.168.1.25
    Phone:  192.168.1.30

This means the VM can see **every other device on your network**.

For something running an experimental AI agent, that felt unnecessary
and potentially dangerous.


###### NAT Networking (What I Chose)

Instead I used **NAT networking**.

In this mode the VM sits behind a virtual router:

    Host
     └── VM (private network)

The VM can:

-   access the internet
-   download packages
-   call APIs

But it **cannot see other devices on my LAN**.

This greatly reduces the blast radius if something goes wrong.

------------------------------------------------------------------------

#### Locking Down the VM Firewall

Inside the VM I also set a simple firewall policy:

    default: deny all incoming connections
    allow: ssh (port 22)

That way the only service exposed internally is SSH.

------------------------------------------------------------------------

#### The NAT Problem: Accessing the VM

NAT networking introduces one inconvenience though: You cannot directly connect to the VM from the host.

To solve this you need **port forwarding**.

Essentially:

    Host port → VM port

------------------------------------------------------------------------

#### The QEMU Port Forwarding Command

Because my VM is managed by **libvirt**, I added a forwarding rule
directly through the QEMU monitor.

The command is:

``` bash
virsh qemu-monitor-command --domain ubuntu24.04 --hmp 'hostfwd_add tcp::2222-:22'
```

Let's break it down.

###### virsh 

The command-line interface for **libvirt**, which manages virtual
machines.

###### qemu-monitor-command

Allows sending commands directly to the **QEMU hypervisor** controlling
the VM.

###### --domain ubuntu24.04

Specifies which VM to target.

###### --hmp

Uses the **Human Monitor Protocol**, a simple command interface for
QEMU.

###### hostfwd_add tcp::2222-:22

This is the actual forwarding rule.

It means:

    host port 2222 → VM port 22

So SSH traffic hitting my laptop on port **2222** gets forwarded into
the VM's **port 22**.

------------------------------------------------------------------------

#### Connecting to the VM

Once the forwarding rule is active, I can SSH into the VM with:

``` bash
ssh -p 2222 clawbot@localhost
```

This lets me:

-   administer the VM
-   patch packages
-   monitor logs

------------------------------------------------------------------------

#### Accessing the OpenClaw Dashboard Securely

OpenClaw exposes a web dashboard.

Instead of exposing that directly, I tunneled it through SSH.

``` bash
ssh -N -L 18789:127.0.0.1:18789 -p 2222 clawbot@localhost
```

This creates a **local port forward**:

    localhost:18789 → VM localhost:18789

So I can open the dashboard safely at:

    http://localhost:18789

without exposing it to the network.

------------------------------------------------------------------------

#### Why This Setup Works Well

This approach gives several layers of protection:

1.  Virtual machine isolation
2.  NAT network isolation
3.  Firewall restrictions
4.  SSH-only access
5.  Local SSH tunneling for web interfaces

If the agent does something unexpected, the damage is limited to the VM.

And if the VM gets compromised, I can simply **destroy and recreate
it**.

------------------------------------------------------------------------

#### Final Thoughts

Running experimental AI agents on your primary machine is probably not a
good idea.

Using a **throwaway VM with strict networking** is an easy way to
experiment safely without needing additional hardware or a paid VPS.

The one-liner that made the setup work was:

``` bash
virsh qemu-monitor-command --domain ubuntu24.04 --hmp 'hostfwd_add tcp::2222-:22'
```

It's a quick way to forward ports from your host into a NAT'd QEMU VM so
you can SSH in and manage it.